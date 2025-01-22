import "./style/global.css";
import "./style/index.css";
import testCase from "./filter"
import { addDomainPrefix } from "./util";


document.addEventListener("DOMContentLoaded", () => {
    const rulesText = document.getElementById("rulesText");

    const caseKeys = Object.keys(testCase)
    const rules = []
    caseKeys.forEach((key) => {
      rules.push(`! type : ${key}`)
      testCase[key].forEach((c) => {
        if(!c.filter) return
        rules.push(addDomainPrefix(c.filter))
      })
    })
    rulesText.textContent = rules.join('\n')

    const toggleButton = document.getElementById("toggleButton");
    const copyButton = document.getElementById("copyButton");
    const rulesContainer = document.getElementById("rulesContainer");

    let isOpen = false;
    toggleButton.addEventListener("click", () => {
        isOpen = !isOpen;
        if (isOpen) {
            rulesContainer.classList.add("open");
            toggleButton.textContent = "숨기기";
        } else {
            rulesContainer.classList.remove("open");
            toggleButton.textContent = "모두보기";
        }
    });

    if (navigator && navigator.clipboard) {
        copyButton.addEventListener("click", () => {
            const textToCopy = rulesText.textContent.trim();
            navigator.clipboard
                .writeText(textToCopy)
                .then(() => {
                    alert("규칙이 복사되었습니다!");
                })
                .catch((err) => {
                    console.error("복사 실패:", err);
                });
        });
    }
});