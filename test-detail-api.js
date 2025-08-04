// Test script to verify detail page API integration
// Run this with: node test-detail-api.js

const API_BASE_URL = "http://localhost:8000/api"

async function testDetailAPI() {
  console.log("Testing Detail Page API integration...")
  
  try {
    // Test 1: Create a test entry first
    console.log("\n1. Creating a test entry...")
    const createResponse = await fetch(`${API_BASE_URL}/journal/entries/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: "2024-01-15",
        ltf: "https://tradingview.com/chart1",
        htf: "https://tradingview.com/chart2",
        bias: "buy",
        array: "FVG",
        pnl: "150.50",
        emotions: "Confident",
        mistake: "Entered too early",
        reason: "Strong support level",
      }),
    })
    
    if (!createResponse.ok) {
      console.log("Failed to create test entry:", await createResponse.text())
      return
    }
    
    const createdEntry = await createResponse.json()
    console.log("✅ Test entry created with ID:", createdEntry.id)
    
    // Test 2: Get the specific entry by ID
    console.log("\n2. Testing GET /api/journal/entries/{id}/")
    const getResponse = await fetch(`${API_BASE_URL}/journal/entries/${createdEntry.id}/`)
    console.log("Status:", getResponse.status)
    
    if (getResponse.ok) {
      const entry = await getResponse.json()
      console.log("✅ Entry retrieved successfully:")
      console.log("  - ID:", entry.id)
      console.log("  - Date:", entry.date)
      console.log("  - Bias:", entry.bias)
      console.log("  - P&L:", entry.pnl)
    } else {
      console.log("❌ Failed to get entry:", await getResponse.text())
    }
    
    // Test 3: Update the entry
    console.log("\n3. Testing PATCH /api/journal/entries/{id}/")
    const updateResponse = await fetch(`${API_BASE_URL}/journal/entries/${createdEntry.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pnl: "200.00",
        emotions: "Excited",
      }),
    })
    
    if (updateResponse.ok) {
      const updatedEntry = await updateResponse.json()
      console.log("✅ Entry updated successfully:")
      console.log("  - New P&L:", updatedEntry.pnl)
      console.log("  - New Emotions:", updatedEntry.emotions)
    } else {
      console.log("❌ Failed to update entry:", await updateResponse.text())
    }
    
    // Test 4: Delete the test entry
    console.log("\n4. Cleaning up - deleting test entry...")
    const deleteResponse = await fetch(`${API_BASE_URL}/journal/entries/${createdEntry.id}/`, {
      method: "DELETE",
    })
    
    if (deleteResponse.ok) {
      console.log("✅ Test entry deleted successfully")
    } else {
      console.log("❌ Failed to delete test entry:", await deleteResponse.text())
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testDetailAPI() 