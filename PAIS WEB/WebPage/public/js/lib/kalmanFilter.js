//칼만 필터 함수
//values : 칼만필터를 적용할 배열
function kalman(values) {
    var x_next, x = 0,
        P_next, P = 1,
        K, Q = 1 / 100000,
        R = 1 / 100,
        z;
    //r배열 하나 새로만들어서 할당해주기 지금은 원래 배열에 덮어써서 원본도 훼손됨
    var result = new Array();

    for (i = 0; i < values.length; i++) {
        result[i] = new Array();

        x_next = x;
        P_next = P + Q;
        K = P_next / (P_next + R);
        z = values[i][1];
        x = x_next + K * (z - x_next);
        P = (1 - K) * P_next;

        result[i][0] = values[i][0];
        result[i][1] = x;
    }

    return result;
}
