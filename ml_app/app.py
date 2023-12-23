from flask import Flask, jsonify, request
from redis import Redis
from rq import Queue
import predict_service

app = Flask('ml-app')

redis_connection = Redis()
q = Queue(connection=redis_connection)


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()
    model = data.get("model")
    sequence = data.get("sequence")

    job = q.enqueue(
        predict_service.get_model(model),
        sequence,
        on_success=predict_service.predict_success_cb,
        on_failure=predict_service.predict_fail_cb
    )

    return jsonify({
        "jobId": job.id,
    }), 202


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
