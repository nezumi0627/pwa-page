// 名前入力デモ
// localStorage に保存した名前を読み込み、表示し、更新できるようにする

document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('nameInput');
  const saveBtn = document.getElementById('saveNameBtn');
  const display = document.getElementById('savedNameDisplay');

  const STORAGE_KEY = 'savedName';

  // 保存済みの名前を表示
  const storedName = localStorage.getItem(STORAGE_KEY);
  if (storedName) {
    display.textContent = `保存済みの名前: ${storedName}`;
    nameInput.value = storedName;
  }

  // 保存ボタン
  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert('名前を入力してください');
      return;
    }
    localStorage.setItem(STORAGE_KEY, name);
    display.textContent = `保存済みの名前: ${name}`;
    alert('名前を保存しました');
  });
});
