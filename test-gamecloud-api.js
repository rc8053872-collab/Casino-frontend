// test-gamecloud-api.js

async function testGameLaunch() {
    console.log("GameCloud API - Game Launch Test Start kar rahe hain...\n");

    // ⚠️ YAHAN APNA ASLI RESELLER ID DALEIN ⚠️
    // Screenshot 2 me "reseller_id": 241 likha hai, aur code me 12. 
    // Apna exact Operator ID yahan dalein.
    const RESELLER_ID = 386; 

    // API Gateway URL (Aapke Docs ke according)
    const GATEWAY_URL = 'https://api.gamecloudapi.com'; 
    const launchUrl = `${GATEWAY_URL}/api/v1/game/launch`;

    // Test karne ke liye dummy player data
    const payload = {
        reseller_id: RESELLER_ID,
        player_id: "player_test_001",
        game_uid: "spribe_aviator", // Kisi bhi game ka code jo aapke catalog me ho
        mode: "seamless",
        currency_code: "INR",
        home_url: "https://maltiplayx.com"
    };

    try {
        console.log(`Connecting to: ${launchUrl}`);
        console.log("Payload:", payload);
        
        const response = await fetch(launchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            data = rawText; 
        }

        if (response.ok) {
            console.log("\n✅ SUCCESS: Game Launch API Work Kar Rahi Hai!");
            console.log("Response Data:", data);
            if (data.status === 'SUCCESS') {
                console.log("\n👉 Game Launch URL:", data.game_launch_url);
                console.log("(Aap is link ko browser me open karke game test kar sakte hain)");
            }
        } else {
            console.log(`\n❌ FAILED: API ne error return kiya (Status: ${response.status})`);
            console.log("Error Details:\n", data);
        }

    } catch (error) {
        console.error("\n❌ ERROR: API se connect nahi ho paaya.");
        console.error("Error Message:", error.message);
    }
}

testGameLaunch();
