// Storage utility for saving code, progress, and completion status
const STORAGE_KEY = 'pandas_bootcamp';

function getStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Save code for a project
export function saveCode(projectId, code) {
    const storage = getStorage();
    if (!storage.codes) storage.codes = {};
    storage.codes[projectId] = code;
    saveStorage(storage);
}

// Load code for a project
export function loadCode(projectId) {
    const storage = getStorage();
    return storage.codes && storage.codes[projectId];
}

// Mark project as completed
export function markCompleted(projectId) {
    const storage = getStorage();
    if (!storage.completed) storage.completed = [];
    if (!storage.completed.includes(projectId)) {
        storage.completed.push(projectId);
        saveStorage(storage);
    }
}

// Check if project is completed
export function isCompleted(projectId) {
    const storage = getStorage();
    return storage.completed && storage.completed.includes(projectId);
}

// Get completed count
export function getCompletedCount() {
    const storage = getStorage();
    return storage.completed ? storage.completed.length : 0;
}

// Get all completed projects
export function getCompletedProjects() {
    const storage = getStorage();
    return storage.completed || [];
}
