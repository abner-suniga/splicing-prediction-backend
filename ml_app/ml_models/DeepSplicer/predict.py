import numpy as np
import sys
from keras.models import load_model

FLANKING_LEN = 200
model = load_model("./models/deep_splicer.h5")


def one_hot_encode(seq):
    """
    A: [1,0,0,0]
    C: [0,1,0,0]
    G: [0,0,1,0]
    T: [0,0,0,1]
    """

    map = np.asarray(
        [[0, 0, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
    )

    seq = seq.upper().replace("A", "\x01").replace("C", "\x02")
    seq = seq.replace("G", "\x03").replace("T", "\x04").replace("N", "\x00")

    return map[np.fromstring(seq, np.int8) % 5]


def transform_sequence_4_prediction(seq, flanking_length=FLANKING_LEN):
    arr_seqs = []
    n = len(seq)
    if n < (flanking_length * 2):
        for i in range(n):
            new_numpy = None
            if i <= flanking_length:
                curr_seq = seq[: i + flanking_length + 1]
                one_hot_seq = one_hot_encode(curr_seq)
                # zeros at the front
                np_zeros_front = np.zeros((flanking_length - i, 4))
                n_curr_seq = len(curr_seq)
                # if n_curr_seq <= flanking_length:
                # zeros at the back
                extra = flanking_length - (n_curr_seq - (i + 1))
                np_zeros_back = np.zeros((extra, 4))
                new_numpy = np.concatenate((np_zeros_front, one_hot_seq, np_zeros_back))
            else:
                curr_seq = seq[i - flanking_length :]
                one_hot_seq = one_hot_encode(curr_seq)
                n_curr_seq = len(curr_seq)
                extra = (2 * flanking_length + 1) - n_curr_seq
                np_zeros_back = np.zeros((extra, 4))
                new_numpy = np.concatenate((one_hot_seq, np_zeros_back))

            arr_seqs.append(new_numpy)
        np_arr_seqs = np.asarray(arr_seqs)
        return np_arr_seqs
    else:
        for i in range(n):
            new_numpy = None
            if i >= flanking_length and i < (n - flanking_length):
                curr_seq = seq[i - flanking_length : i + flanking_length + 1]
                new_numpy = one_hot_encode(curr_seq)
                # print(i, " :",one_hot_seq.shape)
            elif i < flanking_length:
                curr_seq = seq[: i + flanking_length + 1]
                one_hot_seq = one_hot_encode(curr_seq)
                # print(i, " :",one_hot_seq.shape)
                np_zeros = np.zeros((flanking_length - i, 4))
                new_numpy = np.concatenate((np_zeros, one_hot_seq))
                # print(i, " :",new_numpy.shape)
            elif i >= n - flanking_length:
                curr_seq = seq[i - flanking_length :]
                one_hot_seq = one_hot_encode(curr_seq)
                np_zeros = np.zeros(((2 * flanking_length + 1) - len(curr_seq), 4))
                new_numpy = np.concatenate((one_hot_seq, np_zeros))
                # print(i, " :", new_numpy.shape)
            arr_seqs.append(new_numpy)
        np_arr_seqs = np.asarray(arr_seqs)
        return np_arr_seqs


def predict(seq_str, model=model):
    seq_np_arr = transform_sequence_4_prediction(seq_str)
    predictions_seq = model.predict(seq_np_arr)
    return predictions_seq
    # np.savetxt(sys.stdout, predictions_seq, delimiter=",", fmt="%.4f")
