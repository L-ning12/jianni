// Pyodide setup and initialization with progress tracking
let pyodideInstance = null;
let isLoading = false;
let loadingCallbacks = [];

export function onPyodideReady(callback) {
    if (pyodideInstance) {
        callback();
    } else {
        loadingCallbacks.push(callback);
    }
}

export async function initPyodide(onProgress) {
    if (pyodideInstance) {
        if (onProgress) onProgress('ready', 'Pyodide 已就绪');
        return pyodideInstance;
    }
    
    if (isLoading) {
        return new Promise((resolve) => {
            loadingCallbacks.push(() => {
                if (onProgress) onProgress('ready', 'Pyodide 已就绪');
                resolve(pyodideInstance);
            });
        });
    }

    isLoading = true;
    try {
        if (onProgress) onProgress('loading', '正在加载 Pyodide 引擎...');
        console.log('Loading Pyodide...');
        
        // Load Pyodide from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });
        
        if (onProgress) onProgress('engine', 'Pyodide 引擎加载完成');
        
        pyodideInstance = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
        });
        
        console.log('Pyodide loaded. Installing packages...');
        if (onProgress) onProgress('packages', '正在安装 pandas, numpy...');
        
        // Install required packages
        await pyodideInstance.loadPackage([
            'pandas',
            'numpy'
        ]);
        
        if (onProgress) onProgress('packages', 'pandas, numpy 安装完成');
        
        // Try to install scikit-learn via micropip
        try {
            if (onProgress) onProgress('ml', '正在安装 scikit-learn...');
            const micropip = pyodideInstance.pyimport('micropip');
            await micropip.install('scikit-learn');
            if (onProgress) onProgress('ml', 'scikit-learn 安装完成');
        } catch (e) {
            console.warn('Failed to install scikit-learn, proceeding without it:', e);
            if (onProgress) onProgress('ml', 'scikit-learn 安装跳过（可选）');
        }
        
        console.log('Pyodide and packages loaded successfully!');
        if (onProgress) onProgress('ready', '环境就绪，可以运行代码了！');
        
        // Call all waiting callbacks
        loadingCallbacks.forEach(cb => cb());
        loadingCallbacks = [];
        
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
