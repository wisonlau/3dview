package main

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"sync"
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
