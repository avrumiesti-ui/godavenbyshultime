async function loadShulData() {
    const container = document.getElementById('shul-list');
    
    try {
        // This "pulls" the data from your database.json file
        const response = await fetch('./database.json');
        
        if (!response.ok) {
            throw new Error('Database file not found');
        }

        const data = await response.json();

        // Clear the "Loading" text
        container.innerHTML = '';

        // Loop through the data and create the HTML for each Shul
        data.forEach(shul => {
            const card = document.createElement('div');
            card.style.border = "1px solid #ccc";
            card.style.margin = "10px";
            card.style.padding = "10px";
            card.style.borderRadius = "8px";

            card.innerHTML = `
                <h2 style="color: #2c3e50;">${shul.name}</h2>
                <p><strong>📍 Address:</strong> ${shul.address}</p>
                <p><strong>👳 Rabbi:</strong> ${shul.rabbi}</p>
                <p><strong>📖 Nusach:</strong> ${shul.nusach}</p>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<p style="color:red;">Error loading data. Make sure database.json is in the same folder as index.html.</p>`;
    }
}

// Start the pull as soon as the page opens
window.onload = loadShulData;
