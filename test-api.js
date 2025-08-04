// Simple test script to verify API integration
// Run this with: node test-api.js

const API_BASE_URL = "http://localhost:8000/api"

async function testAPI() {
  console.log("Testing API integration...")
  
  try {
    // Test 1: Get all entries
    console.log("\n1. Testing GET /api/journal/entries/")
    const getResponse = await fetch(`${API_BASE_URL}/journal/entries/`)
    console.log("Status:", getResponse.status)
    if (getResponse.ok) {
      const entries = await getResponse.json()
      console.log("Entries found:", entries.length)
    } else {
      console.log("Error:", await getResponse.text())
    }

    // Test 2: Create a new entry
    console.log("\n2. Testing POST /api/journal/entries/")
    const createResponse = await fetch(`${API_BASE_URL}/journal/entries/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: null,
        ltf: "",
        htf: "",
        bias: "",
        array: "",
        pnl: "0",
        emotions: "",
        mistake: "",
        reason: "",
      }),
    })
    console.log("Status:", createResponse.status)
    if (createResponse.ok) {
      const newEntry = await createResponse.json()
      console.log("Created entry ID:", newEntry.id)
      
      // Test 3: Update the entry
      console.log("\n3. Testing PATCH /api/journal/entries/{id}/")
      const updateResponse = await fetch(`${API_BASE_URL}/journal/entries/${newEntry.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bias: "buy",
          pnl: "100.50",
        }),
      })
      console.log("Update Status:", updateResponse.status)
      if (updateResponse.ok) {
        const updatedEntry = await updateResponse.json()
        console.log("Updated entry bias:", updatedEntry.bias)
        console.log("Updated entry P&L:", updatedEntry.pnl)
      } else {
        console.log("Update Error:", await updateResponse.text())
      }
      
      // Test 4: Delete the entry
      console.log("\n4. Testing DELETE /api/journal/entries/{id}/")
      const deleteResponse = await fetch(`${API_BASE_URL}/journal/entries/${newEntry.id}/`, {
        method: "DELETE",
      })
      console.log("Delete Status:", deleteResponse.status)
    } else {
      console.log("Create Error:", await createResponse.text())
    }

    // Test 5: Get trading stats
    console.log("\n5. Testing GET /api/journal/stats/")
    const statsResponse = await fetch(`${API_BASE_URL}/journal/stats/`)
    console.log("Stats Status:", statsResponse.status)
    if (statsResponse.ok) {
      const stats = await statsResponse.json()
      console.log("Trading stats:", stats)
    } else {
      console.log("Stats Error:", await statsResponse.text())
    }

  } catch (error) {
    console.error("Test failed:", error.message)
  }
}

// Run the test
testAPI() 