from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import Counter
from bs4 import BeautifulSoup
import requests
import re

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins="http://localhost:3000")

@app.route('/api/fetch-words', methods=['POST'])
def fetch_words():
    data = request.get_json()
    url = data.get('url')
    num_words = data.get('numWords', 10)  # Default to 10 if not provided

    try:
        num_words = int(num_words)
        if num_words <= 0:
            return jsonify({"error": "Number of words must be positive"}), 400
    except ValueError:
        return jsonify({"error": "Invalid number of words"}), 400

    try:
        # Fetch the webpage content
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove unwanted tags (script, style, etc.)
        for element in soup(["script", "style", "header", "footer", "nav", "aside"]):
            element.extract()

        # Extract visible text, skipping elements with `display: none` or `visibility: hidden`
        visible_text = []
        for element in soup.find_all(string=True):
            # Check for display:none or visibility:hidden
            parent = element.parent
            if parent and parent.has_attr('style'):
                style = parent['style'].replace(" ", "").lower()
                if "display:none" in style or "visibility:hidden" in style:
                    continue
            visible_text.append(element.strip())

        # Join text with spaces to match the browser format
        text = ' '.join(visible_text)

        # Tokenize words (handling punctuation correctly)
        words = re.findall(r"\b[\w'-]+\b", text.lower())

        # Exclude stop words
        stop_words = ["the", "and", "of", "in", "to", "a", "is", "it", "that", "as", "was", "for", "on", "with", "by", "at", "but", "from", "or", "an", "are", "not", "this", "be", "which", "have", "has", "one", "all", "their", "we", "when", "your", "can", "there", "use", "any", "would", "put", "how", "make", "some", "our", "out", "so", "if", "my", "up", "no", "go", "about", "get", "like", "him", "into", "hasnt", "theres", "heres", "were", "youre", "hes", "ive", "theyre", "im", "youll", "isnt", "arent", "wasnt", "werent", "dont", "doesnt", "havent", "couldnt", "shouldnt", "cant", "mustnt", "mightnt", "neednt"]
        words = [word for word in words if word not in stop_words]
        # Count word frequency
        word_counts = Counter(words).most_common(num_words)

        # Prepare the data for JSON response
        words_data = [{"word": word, "frequency": freq} for word, freq in word_counts]

        return jsonify({"words": words_data})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)

