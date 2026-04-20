function saveCode(projectId, code) {
    try {
        localStorage.setItem(`code_${projectId}`, code);
        return true;
    } catch (error) {
        console.error("Failed to save code:", error);
        return false;
    }
}

function loadCode(projectId) {
    try {
        return localStorage.getItem(`code_${projectId}`) || '';
    } catch (error) {
        console.error("Failed to load code:", error);
        return '';
    }
}

function saveCompletionStatus(projectId, completed) {
    try {
        localStorage.setItem(`completed_${projectId}`, completed ? 'true' : 'false');
        return true;
    } catch (error) {
        console.error("Failed to save completion status:", error);
        return false;
    }
}

function getCompletionStatus(projectId) {
    try {
        return localStorage.getItem(`completed_${projectId}`) === 'true';
    } catch (error) {
        console.error("Failed to get completion status:", error);
        return false;
    }
}

function clearStorage() {
    try {
        // 只清除与项目相关的存储
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('code_') || key.startsWith('completed_')) {
                localStorage.removeItem(key);
            }
        }
        return true;
    } catch (error) {
        console.error("Failed to clear storage:", error);
        return false;
    }
}