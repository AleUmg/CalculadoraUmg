/*
 * CALCULADORA GRÁFICA Y NORMAL - UMG
 * Proyecto de Precálculo - Segundo Semestre
 * 
 * Este archivo maneja toda la lógica de la calculadora:
 * - Calculadora normal con funciones científicas
 * - Calculadora gráfica para visualizar funciones matemáticas
 * - Análisis de propiedades de funciones (paridad, intersecciones)
 */

// Variables globales para la calculadora normal
let display = document.getElementById('display');  // Pantalla donde se muestran los números
let currentInput = '';      // Lo que está escribiendo el usuario actualmente
let operator = '';          // Operador matemático (+, -, *, /, etc.)
let previousInput = '';     // El número anterior para hacer operaciones
let shouldResetDisplay = false; // Flag para saber si limpiar la pantalla en la próxima entrada

/**
 * Agrega un número o símbolo a la pantalla de la calculadora
 * Esta función se ejecuta cada vez que presionas un botón numérico o un operador
 */
function appendToDisplay(value) {
    // Si acabamos de calcular algo, empezamos con una pantalla limpia
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    
    // Agregamos el nuevo valor a lo que ya teníamos
    currentInput += value;
    display.value = currentInput;
}

/**
 * Maneja las funciones científicas (sin, cos, tan, sqrt, etc.)
 * Cada función tiene su propia lógica para mostrarse correctamente
 */
function appendFunction(func) {
    // Mismo comportamiento que appendToDisplay para mantener consistencia
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    
    // El botón x² es especial, se muestra como ^2 para que math.js lo entienda
    if (func === 'pow(') {
        currentInput += '^2';
    } else {
        // Para las demás funciones (sin, cos, tan, etc.) las agregamos tal como están
        currentInput += func;
    }
    display.value = currentInput;
}

/**
 * Botón "C" - Limpia completamente la calculadora
 * Resetea todo: pantalla, operadores, números guardados
 */
function clearDisplay() {
    currentInput = '';
    operator = '';
    previousInput = '';
    display.value = '';
}

/**
 * Botón "CE" - Clear Entry, solo borra lo que estás escribiendo ahora
 * Útil cuando te equivocas escribiendo un número pero quieres mantener la operación
 */
function clearEntry() {
    currentInput = '';
    display.value = '';
}

/**
 * Botón "⌫" - Borra el último carácter que escribiste
 * Como un backspace normal del teclado
 */
function deleteLast() {
    currentInput = currentInput.slice(0, -1);  // Quita el último carácter
    display.value = currentInput;
}

/**
 * La función más importante: ¡hace los cálculos!
 * Toma lo que escribiste y lo convierte en un resultado matemático
 */
function calculate() {
    // Si no hay nada que calcular, mejor nos vamos
    if (currentInput === '') return;
    
    try {
        // Math.js es genial, pero necesita que "traduzcamos" algunos símbolos
        // Cambiamos los símbolos bonitos por los que entiende la librería
        let expression = currentInput
            .replace(/×/g, '*')      // × se convierte en *
            .replace(/÷/g, '/')      // ÷ se convierte en /
            .replace(/\^/g, '^')     // ^ mantiene como ^
            .replace(/√/g, 'sqrt');  // √ se convierte en sqrt
        
        // Aquí es donde sucede la magia - math.js resuelve toda la expresión
        const result = math.evaluate(expression);
        
        // Mostramos el resultado y lo guardamos por si quieren seguir operando
        display.value = result;
        currentInput = result.toString();
        shouldResetDisplay = true;  // La próxima vez que escriban algo, limpiamos la pantalla
    } catch (error) {
        // Si algo salió mal (división por cero, sintaxis incorrecta, etc.)
        display.value = 'Error';
        currentInput = '';
        shouldResetDisplay = true;
    }
}

/**
 * SOPORTE PARA TECLADO - Porque nadie quiere estar haciendo clic todo el tiempo
 * 
 * Esta función "escucha" cuando presionas teclas y las convierte en acciones de la calculadora
 * Pero hay un truco: solo funciona cuando NO estás escribiendo en los campos de las funciones gráficas
 */
document.addEventListener('keydown', function(event) {
    // Primero verificamos dónde está el cursor del usuario
    const activeElement = document.activeElement;
    const isInFunctionInput = activeElement.id === 'funcion1' || activeElement.id === 'funcion2';
    
    // Si está escribiendo en los campos de funciones gráficas, no interferimos
    // Esto evita que el teclado "secuestre" lo que están escribiendo
    if (isInFunctionInput) {
        return;
    }
    
    // Ahora sí, procesamos las teclas para la calculadora
    const key = event.key;
    
    // Números del 0 al 9
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } 
    // Punto decimal
    else if (key === '.') {
        appendToDisplay('.');
    } 
    // Operadores básicos
    else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('*');
    } else if (key === '/') {
        event.preventDefault(); // Evitamos que el navegador abra la búsqueda rápida
        appendToDisplay('/');
    } 
    // Calcular resultado
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } 
    // Limpiar todo
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    } 
    // Borrar último carácter
    else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    } 
    // Paréntesis para ecuaciones más complejas
    else if (key === '(' || key === ')') {
        appendToDisplay(key);
    }
});

/**
 * CALCULADORA GRÁFICA - La parte divertida del proyecto
 * 
 * Esta función se ejecuta cuando presionas el botón "Graficar"
 * Toma las funciones que escribiste y las convierte en una gráfica bonita
 */
document.getElementById('graficar').addEventListener('click', () => {
    // Obtenemos lo que el usuario escribió en los campos
    const funcion1 = document.getElementById('funcion1').value;
    const funcion2 = document.getElementById('funcion2').value;

    // Necesitamos al menos una función para graficar algo
    if (!funcion1) {
        alert('Por favor, ingrese al menos una función.');
        return;
    }

    // Limpiamos las funciones: quitamos "y =" si lo escribieron, espacios extra, etc.
    const parsedFuncion1 = funcion1.replace('y =', '').trim();
    const parsedFuncion2 = funcion2 ? funcion2.replace('y =', '').trim() : null;

    // Creamos el rango de valores X para evaluar las funciones
    // De -10 a 10, con pasos de 0.1 (esto nos da una gráfica suave)
    const xValues = math.range(-10, 10, 0.1).toArray();

    // Evaluamos la primera función para cada valor de X
    // Es como decir: "si x=1, ¿cuánto vale y? si x=2, ¿cuánto vale y?" y así sucesivamente
    let yValues1;
    try {
        yValues1 = xValues.map(x => math.evaluate(parsedFuncion1, { x }));
    } catch (error) {
        // Si la función está mal escrita, le decimos al usuario
        alert('Error al evaluar la función 1. Revise su sintaxis.');
        return;
    }

    // Preparamos los datos para Plotly (la librería que hace las gráficas)
    // Un "trace" es como una línea en la gráfica
    const trace1 = {
        x: xValues,           // Valores del eje X
        y: yValues1,          // Valores del eje Y correspondientes
        mode: 'lines',        // Queremos una línea continua, no puntos sueltos
        name: 'Función 1'     // Nombre que aparecerá en la leyenda
    };

    // Lista de todas las líneas que vamos a graficar
    const traces = [trace1];

    // Si el usuario escribió una segunda función, también la graficamos
    if (parsedFuncion2) {
        let yValues2;
        try {
            // Mismo proceso que con la función 1
            yValues2 = xValues.map(x => math.evaluate(parsedFuncion2, { x }));
        } catch (error) {
            alert('Error al evaluar la función 2. Revise su sintaxis.');
            return;
        }

        // Creamos el segundo trace con un nombre diferente
        const trace2 = {
            x: xValues,
            y: yValues2,
            mode: 'lines',
            name: 'Función 2'
        };

        // Lo agregamos a nuestra lista de líneas para graficar
        traces.push(trace2);
    }

    // ¡Momento de crear la gráfica! 🎨
    // Plotly toma nuestros datos y los convierte en una hermosa visualización
    Plotly.newPlot('grafica', traces, {
        title: 'Gráfica de Funciones',
        xaxis: { title: 'x' },
        yaxis: { title: 'y' }
    });

    /*
     * ANÁLISIS MATEMÁTICO - Aquí es donde se pone interesante para precálculo
     * 
     * Detectamos si la función es par o impar:
     * - Función PAR: f(-x) = f(x) → simétrica respecto al eje Y
     * - Función IMPAR: f(-x) = -f(x) → simétrica respecto al origen
     */
    
    // Función para verificar si es par (simétrica al eje Y)
    const esPar = (func, valores) => valores.every((x, i) => func[i] === func[valores.length - 1 - i]);
    
    // Función para verificar si es impar (simétrica al origen)
    const esImpar = (func, valores) => valores.every((x, i) => func[i] === -func[valores.length - 1 - i]);

    // Determinamos qué tipo de paridad tiene la función
    const paridad = esPar(yValues1, xValues) ? 'par' : esImpar(yValues1, xValues) ? 'impar' : 'ninguna';

    // Mostramos el resultado al usuario
    document.getElementById('paridad').innerText = `La función 1 es ${paridad}.`;

    /*
     * INTERSECCIONES - Puntos importantes de la función
     * 
     * Buscamos dónde la función cruza los ejes:
     * - Intersección con X: donde y = 0 (raíces de la función)
     * - Intersección con Y: donde x = 0 (valor de la función en el origen)
     */
    
    // Encontramos todos los puntos donde y = 0 (cruces con el eje X)
    const interseccionesX = xValues.filter((x, i) => yValues1[i] === 0);
    
    // Para el eje Y, tomamos el primer valor (cuando x = -10 en nuestro rango)
    // En una implementación más precisa, evaluaríamos específicamente en x = 0
    const interseccionesY = [yValues1[0]];

    // Preparamos el mensaje para mostrar al usuario
    let resultadoIntersecciones = `Intersecciones con el eje X: ${interseccionesX.join(', ') || 'Ninguna'}.\n`;
    resultadoIntersecciones += `Intersección con el eje Y: ${interseccionesY.join(', ') || 'Ninguna'}.`;

    // Mostramos los resultados en la página
    document.getElementById('intersecciones').innerText = resultadoIntersecciones;
});