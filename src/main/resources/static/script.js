document.addEventListener("DOMContentLoaded", () => {

    fetch("/anime")
        .then(response => {

            if (!response.ok) {
                throw new Error("HTTPエラー : " + response.status);
            }

            return response.json();
        })
        .then(data => {

            console.log("アニメ一覧");
            console.log(data);

        })
        .catch(error => {

            console.error("アニメ一覧の読み込みに失敗しました");
            console.error(error);

        });

});