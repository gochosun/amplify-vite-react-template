import { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { fetchUserAttributes } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

function App() {
  const { signOut } = useAuthenticator();
  const client = generateClient<Schema>();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("고객님");

  useEffect(() => {
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        const name =
          attrs.nickname ||
          attrs.name ||
          attrs.preferred_username ||
          attrs.email;
        if (name) setDisplayName(name);
      } catch {
        // ignore
      }
    })();

    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        setTodos([...data.items]);
        setIsLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  // 클릭 직후 포커스를 해제해서 버튼이 눌린 상태로 남지 않도록 처리
  function createTodo(e?: MouseEvent<HTMLButtonElement>) {
    const btn = e?.currentTarget;
    btn?.blur(); // 즉시 해제
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
    // 확인/취소 모두 프롬프트 종료 직후 한 번 더 보장
    setTimeout(() => btn?.blur(), 0);
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "5px solid lightgray",
    borderTop: "5px solid #4caf50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  } as const;

  const styles = `
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      overflow-x: hidden;
      min-height: 100vh;
      font-family: sans-serif;
      /* ChatGPT 느낌의 밝은 파스텔 그라데이션 배경 */
      background: linear-gradient(
        to bottom right,
        #f0f4fa 0%,
        #dfe8f5 50%,
        #f4f8fd 100%
      );
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    main {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      min-height: 100vh;
      padding: 1.5rem;
    }

    .content-container {
      width: 100%;
      max-width: 960px;
      padding: 0 1rem;
      margin: 0 auto;
      position: relative;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      text-align: center;
    }

    /* 상단 우측 배지 영역 */
    .top-row {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 0.25rem 0 0.5rem 0;
    }

    .user-badge {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #fff;
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      user-select: none;
      overflow: hidden;
    }

    button {
      margin: 0.5rem 0;
      padding: 1rem;
      font-size: 1.125rem;
      cursor: pointer;
      background-color: #000;
      color: #fff;
      border: none;
      border-radius: 5px;
      width: 100%;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      background: none;
      border: none;
    }

    li {
      background: #fff;
      color: #000;
      padding: 1rem;
      border-radius: 5px;
      cursor: pointer;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      font-size: 1.125rem;
    }

    li:hover {
      background-color: rgba(255,255,255,0.7);
    }

    @media (max-width: 375px) {
      .content-container { padding: 0 0.25rem; }
      h1 { font-size: 1.4rem; }
      .user-badge { width: 42px; height: 42px; font-size: 0.95rem; }
      button { font-size: 1rem; padding: 0.75rem; }
      li { font-size: 1rem; padding: 0.75rem; }
    }

    @media (max-width: 480px) {
      .content-container { padding: 0 0.25rem; }
      h1 { font-size: 1.5rem; }
      .user-badge { width: 44px; height: 44px; font-size: 0.95rem; }
      button { font-size: 1.05rem; padding: 0.85rem; }
      li { font-size: 1.05rem; padding: 0.85rem; }
    }

    @media (max-width: 768px) {
      h1 { font-size: 1.75rem; }
      button { font-size: 1.1rem; padding: 1rem; }
      li { font-size: 1.1rem; padding: 1rem; }
    }
  `;

  const avatarText = (displayName || "").slice(0, 2);

  return (
    <main>
      <style>{styles}</style>

      {isLoading ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <div style={spinnerStyle}></div>
          <p style={{ marginTop: "1rem" }}>할 일 목록을 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="content-container">
          <h1>{displayName}님, 환영합니다 👋</h1>

          {/* + new 버튼 위, 오른쪽 가장자리 배지 */}
          <div className="top-row">
            <div className="user-badge" title={displayName}>
              {avatarText}
            </div>
          </div>

          {/* 클릭 시 이벤트를 전달하여 내부에서 blur 처리 */}
          <button type="button" onClick={(e) => createTodo(e)}>
            + new
          </button>

          {todos.length === 0 ? (
            <p>현재 등록된 할 일이 없습니다.</p>
          ) : (
            <ul>
              {todos.map((todo) => (
                <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
                  {todo.content}
                </li>
              ))}
            </ul>
          )}

          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </main>
  );
}

export default function AppWrapper() {
  const agreedRef = useRef(false);

  return (
    <Authenticator
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <div className="amplify-field">
                  <label className="amplify-label" htmlFor="nickname">
                    Name
                  </label>
                  <input
                    className="amplify-input"
                    type="text"
                    name="nickname"
                    id="nickname"
                    placeholder="Enter your Name"
                    required
                    onInvalid={(e) => {
                      (e.target as HTMLInputElement).setCustomValidity("Name을 입력해주세요.");
                    }}
                    onInput={(e) => {
                      (e.target as HTMLInputElement).setCustomValidity("");
                    }}
                  />
                </div>

                <Authenticator.SignUp.FormFields />

                <div className="amplify-field" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    onChange={(e) => {
                      agreedRef.current = e.target.checked;
                    }}
                    required
                  />
                  <label htmlFor="agreeTerms">&nbsp;이용약관에 동의합니다.</label>
                </div>
              </>
            );
          },
          Footer() {
            return (
              <div style={{ fontSize: "0.8rem", marginTop: "1rem" }}>
                회원가입을 진행하면 <a href="/terms" target="_blank" rel="noopener noreferrer">이용약관</a> 및 <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a>에 동의한 것으로 간주합니다.
              </div>
            );
          },
        },
      }}
      services={{
        async validateCustomSignUp() {
          if (!agreedRef.current) {
            return {
              acknowledgement: "이용약관에 동의해야 회원가입이 가능합니다.",
            };
          }
        },
      }}
      signUpAttributes={["email", "nickname"]}
    >
      <App />
    </Authenticator>
  );
}