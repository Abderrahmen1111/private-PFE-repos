import re

file_path = r"C:\Users\INFOKOM\Desktop\private-PFE-repos\SEQUENCE_DIAGRAMS_WORD_FORMAT_OPTIMIZED.md"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "POST /signUp": "signUp()",
    "POST /verify": "verifyOtp()",
    "POST /signIn": "signInWithPassword()",
    "GET Session": "getSession()",
    "POST /store": "createStore()",
    "POST/Approve": "updateStoreStatus()",
    "PUT /profile": "updateStoreProfile()",
    "GET store/id": "getStoreById()",
    "POST /item": "createItem()",
    "GET /items": "fetchItems()",
    "POST /ban": "banItem()",
    "UPDATE state": "updateCart()",
    "POST /orders": "createOrder()",
    "PUT /order": "updateOrderStatus()",
    "POST /verifyQR": "verifyQR()",
    "POST /cancel": "cancelOrder()",
    "POST /booking": "createBooking()",
    "PUT /schedules": "updateSchedules()",
    "POST /complete": "updateBookingStatus()",
    "POST/search": "doGlobalSemanticSearch()",
    "POST base64": "analyzeImage()",
    "GET /explore": "fetchExploreData()",
    "POST Vidéo": "publishReel()",
    "POST /like": "trackReelInteraction()",
    "Track Share": "trackReelInteraction()",
    "POST /review": "submitReview()",
    "POST prompt": "respondToReview()",
    "POST /ticket": "createTicket()",
    "POST /report": "reportContent()",
    "POST /suspend": "suspendUser()",
    "POST /pay": "createPaymentIntent()",
    "POST /sub": "createSubscription()",
    "GET /metrics": "getOverviews()",
    "POST /chat": "generateChatResponse()",
}

for old, new in replacements.items():
    # To keep the ASCII table aligned, pad with spaces if the new string is shorter than the old one
    # Note: if the new string is longer, it might slightly shift the right border `|`
    padded_new = new.ljust(len(old)) if len(new) <= len(old) else new
    content = content.replace(old, padded_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
