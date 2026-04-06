// --- DEEL 1: Bar Rekentool (Gebruikt in Index.html) ---
function calculateTotal() {
    // Haalt de waarden op en berekent het totaal
    const beer = (document.getElementById('beer').value || 0) * 50;
    const whiskey = (document.getElementById('whiskey').value || 0) * 150;
    const champagne = (document.getElementById('champagne').value || 0) * 500;

    const total = beer + whiskey + champagne;
    
    // Toont het resultaat in het Index.html scherm
    document.getElementById('total-display').innerText = "Totaal: $" + total;
}

// --- DEEL 2: Gedeelde Room Timers via Firebase (Gebruikt in timers.html) ---
const firebaseConfig = {
    // Jouw specifieke Firebase Realtime Database URL
    databaseURL: "https://vanillaunicorntimers-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Functie om een timer te starten en de eindtijd op te slaan in de cloud
function startTimer(seconds, displayId) {
    const endTime = Date.now() + (seconds * 1000);
    
    // Slaat de eindtijd op in Firebase zodat andere gebruikers dit ook zien
    fetch(`${firebaseConfig.databaseURL}/timers/${displayId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ endTime: endTime })
    });
}

// Functie die elke seconde controleert of er updates zijn in de database
function syncTimers() {
    setInterval(() => {
        fetch(`${firebaseConfig.databaseURL}/timers.json`)
            .then(res => res.json())
            .then(data => {
                if (!data) return;
                
                for (let displayId in data) {
                    const now = Date.now();
                    const remaining = Math.round((data[displayId].endTime - now) / 1000);
                    const display = document.getElementById(displayId);
                    
                    if (!display) continue;

                    if (remaining > 0) {
                        updateDisplay(remaining, display);
                    } else if (remaining > -60) { 
                        // Toont 'TIJD OM!' gedurende 1 minuut nadat de timer is afgelopen
                        display.textContent = "TIJD OM!";
                        display.style.color = "red";
                    } else {
                        // Reset naar de standaard weergave na die minuut
                        display.textContent = "00:00";
                        display.style.color = "#ff00ff";
                    }
                }
            })
            .catch(error => console.error("Firebase sync error:", error));
    }, 1000);
}

// Hulpfunctie om de tekst in het scherm netjes te formatteren (00:00)
function updateDisplay(seconds, display) {
    let minutes = parseInt(seconds / 60, 10);
    let secs = parseInt(seconds % 60, 10);
    
    minutes = minutes < 10 ? "0" + minutes : minutes;
    secs = secs < 10 ? "0" + secs : secs;
    
    display.textContent = minutes + ":" + secs;
    display.style.color = "#ff00ff"; // Neon roze kleur tijdens het lopen
}

// Start het synchronisatieproces zodra het script geladen wordt
syncTimers();