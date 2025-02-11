from flask import Flask, render_template, request, jsonify
from core import AISearch

sample_response = {
    "result": """""",
}

app = Flask(__name__)

@app.route('/')
async def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
async def search():
    query = request.json['query']
    if query == "test":
        return jsonify(sample_response)
    search = AISearch()
    result = await search.search(query)
    result = result['answer']
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)

