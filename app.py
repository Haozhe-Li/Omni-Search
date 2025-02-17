from flask import Flask, render_template, request, jsonify
from core.aisearch import AISearch
from core.test_response import get_sample_response
from core.suggestion import get_suggestion
import time
import os

is_dev = os.environ.get("DEV", 0)
allowed_hosts = os.environ.get("ALLOWED_HOSTS", "").split(",")

app = Flask(__name__)
search = AISearch()


def request_come_from(request):
    """
    Check if the request comes from the same domain
    Returns: bool
    """
    referer = request.headers.get("Referer", "")
    origin = request.headers.get("Origin", "")
    # make sure the referer is in the allowed hosts and the origin is in the allowed hosts
    if any([host in referer for host in allowed_hosts]) and any(
        [host in origin for host in allowed_hosts]
    ):
        return True
    return False


@app.route("/")
async def index():
    return render_template("index.html")


@app.route("/getsuggestion")
async def getsuggestion():
    language = request.args.get("language")
    return jsonify(get_suggestion(language))


@app.route("/search", methods=["POST"])
async def main():
    try:
        if not request_come_from(request):
            raise Exception("Request not allowed")
        query = request.json["query"]
        mode = request.json["mode"]
        if len(query) > 50:
            title = f"# {query[:50]}...\n\n------\n\n"
        else:
            title = f"""# {query}\n\n------\n\n"""
        footer = """\n\n------\n\n"""
        if query == "test":
            result = title + get_sample_response() + footer
            time.sleep(3)
            return jsonify({"result": result})
        if query == "longtest":
            result = title + get_sample_response() + footer
            time.sleep(10)
            return jsonify({"result": result})
        result = (
            await search.search(query)
            if mode == "universal"
            else await search.quick_search(query)
        )
        result = title + result["answer"] + footer
        return jsonify({"result": result})
    except Exception as e:
        raise e
        return jsonify(
            {
                "result": "Hi I'm Omni, but something went wrong! Could you please try again?"
            }
        )


if __name__ == "__main__":
    if is_dev:
        app.run(debug=True)
    else:
        app.run()
