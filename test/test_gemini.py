import google.generativeai as genai

# paste your API key here temporarily for testing
genai.configure(api_key="AIzaSyABt-642rNNWHVSSYARi16h2uK4W7vXpck")

# check available models
print("Available models:")
for m in genai.list_models():
    print(m.name)

print("\nTesting generation...\n")

model = genai.GenerativeModel("gemini-flash-latest")

response = model.generate_content("Explain AI in 2 lines")

print(response.text)