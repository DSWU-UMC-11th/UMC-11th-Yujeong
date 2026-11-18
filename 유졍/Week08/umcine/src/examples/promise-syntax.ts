function getMovieTitle(): Promise<string> {
  return Promise.resolve("인셉션");
}

function loadWithThen() {
  return getMovieTitle()
    .then((title) => console.log(`.then(): ${title}`))
    .catch((error) => console.error(error));
}

async function loadWithAsyncAwait() {
  try {
    const title = await getMovieTitle();
    console.log(`async/await: ${title}`);
  } catch (error) {
    console.error(error);
  }
}

loadWithThen();
loadWithAsyncAwait();

// .then().catch()와 async/await 비교:

// 두 문법은 서로 다른 요청 방식이 아니라,
// 같은 promise를 읽는 두 가지 표현.
