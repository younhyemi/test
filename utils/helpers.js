// URL 파라미터 가져오기
export function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 숫자 포맷팅 (천단위 콤마)
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 금액 포맷팅
export function formatPrice(price) {
  return formatNumber(price) + '원';
}

// 확인 팝업
export function confirmAction(message) {
  return window.confirm(message);
}

// 날짜 포맷팅
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

