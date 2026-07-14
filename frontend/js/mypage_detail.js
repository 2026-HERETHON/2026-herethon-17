document.addEventListener("DOMContentLoaded", () => {
  // 화면에 있는 모든 게시글 카드(.post-card) 가져오기
  const postCards = document.querySelectorAll(".post-card");

  // 각각의 카드에 클릭 이벤트 달기
  postCards.forEach(card => {
    card.addEventListener("click", () => {
      // HTML에 적어둔 data-id 값을 가져옴. (없을 경우를 대비해 '1'을 기본값으로)
      const postId = card.getAttribute("data-id") || "1";
      
      // 해당 id를 파라미터로 붙여서 상세 페이지로 이동
      // 예: community_detail.html?id=1
      window.location.href = `community_detail.html?id=${postId}`;
    });
  });
});