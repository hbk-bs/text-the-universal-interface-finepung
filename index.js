// @ts-check
const apiEndpoint = 'https://ff6347-openai-api-image.val.run/';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const resultContainer = document.getElementById('result');
        const imageContainer = document.getElementById('image-container');

        // Show loading state
        let loadingInterval = showLoadingIndicator(resultContainer);

        try {
            const formData = new FormData(form);
            const file = formData.get('image');
            
            if (!(file instanceof File)) {
                throw new Error('No file selected');
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
        } catch (error) {
            console.error('Error:', error);
            if (resultContainer) {
                resultContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            }
        } finally {
            clearInterval(loadingInterval);
        }
    });
});

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
        throw new Error('No file selected');
    }
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
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
                    content: `Du bist ein Generator für kitschige Kalendersprüche. Befolge diese Regeln:
                        1. Zunächst identifiziere die wichtigsten Elemente im Bild
                        2. Wenn das Bild unklar oder abstrakt ist, generiere ein zufälliges inspirierendes Zitat
                        3. Formatiere deine Antwort immer als JSON-Objekt: {quote: string, attribution: string}
                        4. Bei erkennbaren Bildern: Beziehe das Zitat auf das, was du siehst
                        5. Bei unklaren Bildern: Nutze universelle Themen wie Träume, Reisen, Kreativität oder Mysterien
                        6. Halte die Zitate kurz und prägnant (max. 2 Sätze)
                        7. Füge Emojis hinzu, wenn sie zur Stimmung passen
                        8. Erfinde kreative Quellen wie "Bergwanderer Weisheiten" oder "Tägliche Lebensfreude"`
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