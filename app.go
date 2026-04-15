package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx           context.Context
	renderProcess *exec.Cmd
	currentModel  string
	mu            sync.Mutex
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		currentModel: "",
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// LoadModel loads a 3D model and returns preview information
func (a *App) LoadModel(filename string) (string, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	// Validate file extension
	ext := strings.ToLower(filename)
	if !strings.HasSuffix(ext, ".glb") && 
	   !strings.HasSuffix(ext, ".gltf") && 
	   !strings.HasSuffix(ext, ".obj") && 
	   !strings.HasSuffix(ext, ".stl") {
		return "", fmt.Errorf("unsupported file format. Only .glb, .gltf, .obj, and .stl are supported")
	}

	// Store the filename (frontend handles the actual file content)
	a.currentModel = filename
	return fmt.Sprintf("Model loaded: %s", filename), nil
}

// StartRendering starts the trophy rendering process and streams output
func (a *App) StartRendering(filepath string) error {
	a.mu.Lock()
	defer a.mu.Unlock()

	// Stop any existing rendering
	a.StopRendering()

	// Check file extension
	ext := strings.ToLower(filepath)
	if ext != ".glb" && ext != ".obj" && ext != ".stl" {
		return fmt.Errorf("unsupported file format. Only .glb, .obj, and .stl are supported")
	}

	// Create trophy command
	cmd := exec.Command("trophy", filepath)
	a.renderProcess = cmd

	return nil
}

// StopRendering stops the current rendering process
func (a *App) StopRendering() {
	a.mu.Lock()
	defer a.mu.Unlock()

	if a.renderProcess != nil && a.renderProcess.Process != nil {
		a.renderProcess.Process.Kill()
		a.renderProcess = nil
	}
}

// GetModelInfo returns information about the loaded model
func (a *App) GetModelInfo() map[string]interface{} {
	a.mu.Lock()
	defer a.mu.Unlock()

	info := make(map[string]interface{})
	info["loaded"] = a.currentModel != ""
	info["path"] = a.currentModel
	info["format"] = a.getFileFormat(a.currentModel)
	return info
}

// getFileFormat returns the file format based on extension
func (a *App) getFileFormat(filepath string) string {
	if filepath == "" {
		return "No file loaded"
	}

	ext := strings.ToLower(filepath)
	switch {
	case strings.HasSuffix(filepath, ".glb"):
		return "GLB (Binary glTF)"
	case strings.HasSuffix(filepath, ".gltf"):
		return "glTF (JSON)"
	case strings.HasSuffix(filepath, ".obj"):
		return "OBJ (Wavefront)"
	case strings.HasSuffix(filepath, ".stl"):
		return "STL (Stereolithography)"
	default:
		return fmt.Sprintf("Unknown (%s)", ext)
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetVersion returns the current application version
func (a *App) GetVersion() string {
	return "v1.0.5"
}

// SaveScreenshot saves a base64-encoded screenshot to a user-selected file
func (a *App) SaveScreenshot(base64Data string) error {
	// Show save file dialog
	defaultFilename := "3dmodel-screenshot.png"
	selectedFile, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename:          defaultFilename,
		Title:                   "Save Screenshot",
		Filters: []runtime.FileFilter{
			{
				DisplayName:  "PNG Image",
				Pattern:     "*.png",
			},
		},
	})

	if err != nil {
		return fmt.Errorf("failed to open save dialog: %v", err)
	}

	if selectedFile == "" {
		return nil // User cancelled the dialog
	}

	// Decode base64 data
	imageData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return fmt.Errorf("failed to decode base64 data: %v", err)
	}

	// Ensure directory exists
	dir := filepath.Dir(selectedFile)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %v", err)
	}

	// Save image data to file
	if err := os.WriteFile(selectedFile, imageData, 0644); err != nil {
		return fmt.Errorf("failed to save screenshot: %v", err)
	}

	return nil
}
