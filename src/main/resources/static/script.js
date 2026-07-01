document.addEventListener("DOMContentLoaded", () => {

    fetch("/anime")
        .then(response => {

            if (!response.ok) {
                throw new Error("HTTP 오류 : " + response.status);
            }

            return response.json();
        })
        .then(data => {

            console.log("애니 목록");
            console.log(data);

        })
        .catch(error => {

            console.error("애니 목록 불러오기 실패");
            console.error(error);

        });

});