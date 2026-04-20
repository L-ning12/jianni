async function runCode(code, outputElement, tableElement) {
    try {
        const pyodide = await loadPyodide();
        
        // 重定向标准输出
        let output = '';
        pyodide.setStdout({ write: (text) => { output += text; } });
        pyodide.setStderr({ write: (text) => { output += text; } });
        
        // 执行代码
        const result = await pyodide.runPythonAsync(code);
        
        // 显示输出
        outputElement.textContent = output;
        
        // 检查是否有DataFrame需要显示
        const dfNames = pyodide.globals.get('df_names') || [];
        if (dfNames.length > 0) {
            let tableHTML = '';
            for (const name of dfNames) {
                const df = pyodide.globals.get(name);
                if (df && df._pytype_ && df._pytype_.name === 'DataFrame') {
                    // 转换DataFrame为HTML
                    const dfHTML = pyodide.runPython(`
                        ${name}.to_html(index=False)
                    `);
                    tableHTML += `<h4>${name}</h4>${dfHTML}`;
                }
            }
            tableElement.innerHTML = tableHTML;
        } else {
            tableElement.innerHTML = '';
        }
        
        return true;
    } catch (error) {
        outputElement.textContent = `Error: ${error.message}`;
        tableElement.innerHTML = '';
        return false;
    }
}

function prepareCodeWithData(code, csvData) {
    // 将CSV数据嵌入到代码中
    const dataCode = `
import pandas as pd
from io import StringIO

# 加载数据
data = StringIO('''${csvData}''')
df = pd.read_csv(data)

# 存储DataFrame名称以便显示
df_names = ['df']
`;
    
    return dataCode + code;
}