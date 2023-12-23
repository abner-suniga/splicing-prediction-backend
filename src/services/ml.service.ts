import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const mlApi = axios.create({
  baseURL: BASE_URL,
});

export const requestPrediction = async ({
  model,
  sequenceId,
  sequence,
}: {
  model: string;
  sequenceId: string;
  sequence: string;
}) => {
  const response = await mlApi.post<{ jobId: string }>(
    "/predict",
    {
      model,
      sequenceId,
      sequence,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
