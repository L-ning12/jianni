// Pyodide setup and initialization
let pyodideInstance = null;
let isLoading = false;

export async function initPyodide() {
    if (pyodideInstance) {
        return pyodideInstance;
    }
    if (isLoading) {
        // Wait for existing load
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return pyodideInstance;
    }

    isLoading = true;
    try {
        console.log('Loading Pyodide...');
        
        // Load Pyodide from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });
        
        pyodideInstance = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
        });
        
        console.log('Pyodide loaded. Installing packages...');
        
        // Install required packages
        await pyodideInstance.loadPackage([
            'micropip',
            'pandas',
            'numpy'
        ]);
        
        // Try to install scikit-learn via micropip
        try {
            const micropip = pyodideInstance.pyimport('micropip');
            await micropip.install('scikit-learn');
        } catch (e) {
            console.warn('Failed to install scikit-learn, proceeding without it:', e);
        }
        
        console.log('Pyodide and packages loaded successfully!');
        return pyodideInstance;
    } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

export function getPyodide() {
    return pyodideInstance;
}
