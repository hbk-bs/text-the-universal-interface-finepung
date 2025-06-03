// @ts-check
const apiEndpoint = 'https://ff6347-openai-api-image.val.run/';

document.addEventListener('DOMContentLoaded', () => {
    // Create custom cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '💖';
    document.body.appendChild(cursor);

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    const form = document.querySelector('form');
    const randomButton = document.getElementById('random-quote-btn');
    
    // Existing form handler
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const resultContainer = document.getElementById('result');
            const imageContainer = document.getElementById('image-container');

            // Show loading state
            const loading = document.querySelector('.loading');
            loading?.classList.add('active');

            try {
                const formData = new FormData(form);
                const file = formData.get('image');
                
                if (!(file instanceof File)) {
                    throw new Error('✨ Oh liebliches Wesen, ich sehne mich nach einem Bildchen von dir! Bitte schenke mir eines! 🌸');
                }

                // Validate file
                validateFile(file);

                // Convert and display image
                const dataURL = await fileToDataURL(file);
                if (imageContainer) {
                    imageContainer.innerHTML = `<img src="${dataURL}" alt="uploaded image" />`;
                }

                // Get API response
                const response = await fetchAPIResponse(dataURL);
                const result = await response.json();

                // Validate and parse response
                const parsedQuote = parseAndValidateResponse(result);

                // Display result
                if (resultContainer) {
                    resultContainer.innerHTML = `
                        <div class="quote-container">
                            <p class="quote">"${parsedQuote.quote}"</p>
                            <p class="attribution">- ${parsedQuote.attribution}</p>
                        </div>
                    `;
                }

                // Nach dem Bildupload oder Generieren eines Spruchs:
                const contentContainer = document.querySelector('.content-container');
                if (contentContainer) {
                    contentContainer.innerHTML = `
                        <img src="${dataURL}" alt="uploaded image" />
                        <div>
                            <p class="quote">"${parsedQuote.quote}"</p>
                            <p class="attribution">- ${parsedQuote.attribution}</p>
                        </div>
                    `;
                    contentContainer.classList.add('active');
                }
            } catch (error) {
                console.error('Error:', error);
                if (resultContainer) {
                    resultContainer.innerHTML = `<p>Error: ${error.message}</p>`;
                }
            } finally {
                // Hide loading when done
                loading?.classList.remove('active');
            }
        });
    }

    // Random quote button handler
    if (randomButton) {
        randomButton.addEventListener('click', async () => {
            const resultContainer = document.getElementById('result');
            let loadingInterval = showLoadingIndicator(resultContainer);

            try {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: `Du bist ein Generator für ultra-kitschige Kalendersprüche. Generiere einen zufälligen, inspirierenden Spruch. Befolge diese Regeln:
                                    1. Formatiere deine Antwort immer als JSON-Objekt: {quote: string, attribution: string}
                                    2. Nutze universelle Themen wie Träume, Reisen, Kreativität oder Mysterien
                                    3. Halte die Zitate kurz und prägnant (max. 2 Sätze)
                                    4. Füge mindestens 2-3 passende Emojis pro Zitat hinzu
                                    5. Erfinde kreative, übertrieben poetische Quellen
                                    6. Verwende überschwängliche Adjektive
                                    7. Füge metaphorische Elemente ein
                                    8. Benutze einen schwärmerischen, gefühlvollen Ton`
                            }
                        ]
                    })
                });

                const result = await response.json();
                const parsedQuote = parseAndValidateResponse(result);
                displayResult(parsedQuote);

            } catch (error) {
                console.error('Error:', error);
                if (resultContainer) {
                    resultContainer.innerHTML = `<p class="error">✨ Oh nein, ein Glitzerwölkchen hat sich verirrt! Bitte versuche es erneut. ✨</p>`;
                }
            } finally {
                clearInterval(loadingInterval);
            }
        });
    }

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const imageResultContainer = document.querySelector('.image-result-container');
            if (imageResultContainer) {
                imageResultContainer.classList.add('active');
            }
        });
    }
});

document.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
        createHeart(e.clientX, e.clientY);
    }
});

function createHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.innerHTML = '💖';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = Math.random() * 20 + 10 + 'px';
    
    // Random movement in all directions
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100 + 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rotation = Math.random() * 360;
    
    heart.style.setProperty('--tx', `${tx}px`);
    heart.style.setProperty('--ty', `${ty}px`);
    heart.style.setProperty('--rotation', `${rotation}deg`);
    
    document.body.appendChild(heart);
    
    heart.addEventListener('animationend', () => {
        heart.remove();
    });
}

function showLoadingIndicator(container) {
    const dots = ['', '.', '..', '...'];
    let index = 0;
    return setInterval(() => {
        if (!container) return;
        container.innerHTML = `<p>Loading${dots[index]}</p>`;
        index = (index + 1) % dots.length;
    }, 100);
}

function validateFile(file) {
    if (!(file instanceof File)) {
        throw new Error('✨ Oh liebliches Wesen, ich sehne mich nach einem Bildchen von dir! Bitte schenke mir eines! 🌸');
    }
    if (!file.type.startsWith('image/')) {
        throw new Error('✨ Oh liebliches Wesen, ich sehne mich nach einem Bildchen von dir! Bitte schenke mir eines! 🎀');
    }
}

async function fetchAPIResponse(dataURL) {
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: `Du bist ein Generator für ultra-kitschige Kalendersprüche. Befolge diese Regeln:
                        1. Zunächst identifiziere die wichtigsten Elemente im Bild
                        2. Wenn das Bild unklar oder abstrakt ist, generiere ein zufälliges inspirierendes Zitat
                        3. Formatiere deine Antwort immer als JSON-Objekt: {quote: string, attribution: string}
                        4. Bei erkennbaren Bildern: Beziehe das Zitat auf das, was du siehst
                        5. Bei unklaren Bildern: Nutze universelle Themen wie Träume, Reisen, Kreativität oder Mysterien
                        6. Halte die Zitate kurz und prägnant (max. 2 Sätze)
                        7. Füge mindestens 2-3 passende Emojis pro Zitat hinzu
                        8. Erfinde kreative, übertrieben poetische Quellen wie:
                           - "Flüsternde Herzensweisheiten"
                           - "Glitzernde Seelenfunken"
                           - "Regenbogenzauber Almanach"
                           - "Einhorn Philosophien"
                        9. Verwende überschwängliche Adjektive wie:
                           - funkelnd, glitzernd, strahlend
                           - zauberhaft, magisch, verzaubernd
                           - himmlisch, engelgleich, göttlich
                        10. Füge metaphorische Elemente ein wie:
                            - Sternenlicht, Mondschein
                            - Blütenblätter, Schmetterlinge
                            - Regenbogen, Goldregen
                        11. Benutze einen schwärmerischen, gefühlvollen Ton
                        12. Baue mindestens eine der folgenden Phrasen ein:
                            - "In deinem Herzen"
                            - "Deine Seele"
                            - "Magischer Moment"
                            - "Zauber des Lebens"`
                },
                {
                    role: 'user',
                    content: [{
                        type: 'image_url',
                        image_url: { url: dataURL }
                    }]
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }

    return response;
}

function parseAndValidateResponse(result) {
    if (!result?.completion?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
    }

    try {
        // Get the raw content
        let content = result.completion.choices[0].message.content;
        
        // Remove code block markers if present
        content = content.replace(/```json\n?|\n?```/g, '');
        
        // Clean the content
        content = content
            .replace(/\\"/g, '"')  // Replace escaped quotes
            .replace(/\n/g, ' ')   // Remove newlines
            .replace(/\r/g, '')    // Remove carriage returns
            .replace(/\t/g, ' ')   // Remove tabs
            .replace(/\s+/g, ' ')  // Collapse multiple spaces
            .trim();               // Remove leading/trailing whitespace

        // Parse the cleaned content
        const parsed = JSON.parse(content);

        // Validate required fields
        if (!parsed.quote || !parsed.attribution) {
            throw new Error('Missing required fields in response');
        }

        return parsed;
    } catch (error) {
        console.error('Raw response:', result.completion.choices[0].message.content);
        throw new Error('Failed to parse API response: ' + error.message);
    }
}

/**
 * Checks the size of an image.
 * @param {string} dataURL - The data URL of the image.
 * @param {number} interval - The interval to clear.
 * @returns {Promise<void>}
 */
async function checkImageSize(dataURL, interval) {
	const img = new Image();
	img.src = dataURL;
	await new Promise((resolve, reject) => {
		img.onload = () => {
			if (img.width > 500 || img.height > 500) {
				clearInterval(interval);
				const resultContainer = document.getElementById('result');
				if (resultContainer)
					resultContainer.innerHTML =
						'<p>Error: Image must be 500x500px or smaller.</p>';
				return reject(new Error('Image too large'));
			}
			resolve(true);
		};
		img.onerror = () => reject(new Error('Image failed to load'));
	});
}

/**
 * Converts a File object to a base64-encoded Data URL string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves to a Data URL (e.g., "data:image/png;base64,...").
 */
async function fileToDataURL(file) {
	const base64String = await fileToBase64(file);

	// Determine the MIME type
	const mimeType = file.type || 'application/octet-stream';

	// Create the Base64 encoded Data URL
	return `data:${mimeType};base64,${base64String}`;
}

/**
 * Converts a File object to a base64-encoded string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves to a base64-encoded string.
 */
async function fileToBase64(file) {
	// Read the file as an ArrayBuffer
	const arrayBuffer = await file.arrayBuffer();

	// Convert ArrayBuffer to a typed array (Uint8Array)
	const uintArray = new Uint8Array(arrayBuffer);

	// Convert typed array to binary string
	const binaryString = uintArray.reduce(
		(acc, byte) => acc + String.fromCharCode(byte),
		'',
	);

	// Encode binary string to base64
	return btoa(binaryString);
}

/**
 * Displays the result in the result container.
 * @param {Object} parsedQuote - The parsed quote object.
 * @param {string} parsedQuote.quote - The quote text.
 * @param {string} parsedQuote.attribution - The quote attribution.
 */
function displayResult({ quote, attribution }) {
    const contentContainer = document.querySelector('.content-container');
    const imageContainer = document.getElementById('image-container');
    const resultContainer = document.getElementById('result');
    
    if (imageContainer && resultContainer) {
        imageContainer.innerHTML = imageContainer.innerHTML; // Keep existing image
        resultContainer.innerHTML = `
            <div class="quote-container">
                <p class="quote">"${quote}"</p>
                <p class="attribution">- ${attribution}</p>
            </div>
        `;
        contentContainer?.classList.add('active');
    }
}

async function handleImageAndQuote() {
    const imageResultContainer = document.querySelector('.image-result-container');
    const loading = document.querySelector('.loading');
    
    // Show loading state
    loading?.classList.add('active');
    
    try {
        // Wait for quote to load
        const response = await fetchAPIResponse('');
        const result = await response.json();
        const quote = parseAndValidateResponse(result);
        
        // Hide loading state
        loading?.classList.remove('active');
        
        // Show container with animation
        imageResultContainer?.classList.add('active');
        
        // Update quote content
        const quoteElement = document.querySelector('.quote');
        if (quoteElement) {
            quoteElement.textContent = quote.text;
        }
        const attributionElement = document.querySelector('.attribution');
        if (attributionElement) {
            attributionElement.textContent = quote.author;
        }
    } catch (error) {
        console.error('Error:', error);
        loading?.classList.remove('active');
    }
}

// Add event listener to your file input
const fileInputElement = document.querySelector('input[type="file"]');
if (fileInputElement) {
    fileInputElement.addEventListener('change', handleImageAndQuote);
}