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

  function createTodo(e?: MouseEvent<HTMLButtonElement>) {
    const btn = e?.currentTarget;
    btn?.blur();
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
    setTimeout(() => btn?.blur(), 0);
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "5px solid #e6edf7",
    borderTop: "5px solid #5b8ef1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  } as const;

  const styles = `
    *, *::before, *::after { box-sizing: border-box; }

    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
    }

    :root { color-scheme: light; }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      overflow-x: hidden;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", "Apple SD Gothic Neo", Arial, sans-serif;
      background: linear-gradient(120deg, #f0f4fa, #e9f1ff, #f5f9ff);
      background-size: 200% 200%;
      animation: bg-drift 28s ease-in-out infinite;
      background-color: #f4f8fd;
      -webkit-tap-highlight-color: rgba(0,0,0,0);
    }

    @keyframes bg-drift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes fade-up { 0% { opacity: 0; transform: translateY(10px);} 100% { opacity: 1; transform: translateY(0);} }
    @keyframes fade-in { from{opacity:0} to{opacity:1} }

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
      animation: fade-up 400ms ease-out both;
      background: transparent;
    }

    h1 {
      font-size: 2rem;
      margin: 0 0 1rem 0;
      text-align: center;
      animation: fade-in 360ms ease-out both;
    }

    .top-row {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 0.25rem 0 0.5rem 0;
      animation: fade-up 420ms ease-out both;
    }

    .user-badge {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #ffffffcc;
      backdrop-filter: blur(4px);
      color: #0b1220;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      user-select: none;
      overflow: hidden;
      transition: transform 160ms ease, box-shadow 200ms ease;
    }
    .user-badge:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.12); }
    .user-badge:active { transform: translateY(0); box-shadow: 0 6px 18px rgba(0,0,0,0.1); }

    button {
      margin: 0.5rem 0;
      padding: 1rem;
      font-size: 1.125rem;
      cursor: pointer;
      background-color: #0b1220;
      color: #fff;
      border: none;
      border-radius: 10px;
      width: 100%;
      transition: transform 160ms ease, box-shadow 200ms ease, opacity 160ms ease, background-color 200ms ease;
      box-shadow: 0 6px 16px rgba(11,18,32,0.15);
      will-change: transform;
      animation: fade-up 440ms ease-out both;
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(11,18,32,0.18); }
    button:active { transform: translateY(0) scale(0.98); box-shadow: 0 6px 16px rgba(11,18,32,0.12); }

    /* 리스트 */
    ul {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: transparent;
      animation: fade-in 280ms ease-out both;
      outline: none;
    }

    li {
      background: #ffffff;
      color: #0b1220;
      padding: 1rem;
      border-radius: 12px;
      cursor: pointer;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      font-size: 1.125rem;
      box-shadow: 0 1px 2px rgba(11,18,32,0.06), 0 6px 16px rgba(11,18,32,0.06);
      transition: transform 140ms ease, box-shadow 180ms ease, background-color 180ms ease, opacity 180ms ease;
      outline: none;
    }
    li:hover { transform: translateY(-2px); box-shadow: 0 2px 6px rgba(11,18,32,0.08), 0 10px 22px rgba(11,18,32,0.08); background-color: #f9fbff; }

    .loading-hint { animation: fade-in 1200ms ease-in-out infinite alternate; opacity: 0.8; }
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
          <p className="loading-hint" style={{ marginTop: "1rem" }}>
            할 일 목록을 불러오는 중입니다...
          </p>
        </div>
      ) : (
        <div className="content-container">
          <h1>{displayName}님, 환영합니다 👋</h1>

          <div className="top-row">
            <div className="user-badge" title={displayName}>
              {avatarText}
            </div>
          </div>

          <button type="button" onClick={(e) => createTodo(e)}>
            + new
          </button>

          {todos.length === 0 ? (
            <p style={{ animation: "fade-in 280ms ease-out both", opacity: 0.9 }}>
              현재 등록된 할 일이 없습니다.
            </p>
          ) : (
            <ul>
              {todos.map((todo, idx) => (
                <li
                  key={todo.id}
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    animation: "fade-up 360ms ease-out both",
                    animationDelay: `${idx * 60}ms`,
                  }}
                >
                  {todo.content}
                </li>
              ))}
            </ul>
          )}

          <button onClick={signOut} style={{ marginTop: "0.75rem" }}>
            Sign out
          </button>
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
                <div className="amplify-field" style={{ animation: "fade-up 380ms ease-out both" }}>
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

                <div style={{ animation: "fade-up 400ms ease-out both" }}>
                  <Authenticator.SignUp.FormFields />
                </div>

                <div
                  className="amplify-field"
                  style={{
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    animation: "fade-up 420ms ease-out both",
                  }}
                >
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
              <div style={{ fontSize: "0.8rem", marginTop: "1rem", animation: "fade-in 360ms ease-out both" }}>
                회원가입을 진행하면 <a href="/terms" target="_blank" rel="noopener noreferrer">이용약관</a> 및 <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a>에 동의한 것으로 간주합니다.
              </div>
            );
          },
        },
      }}
      services={{
        async validateCustomSignUp() {
          if (!agreedRef.current) {
            return { acknowledgement: "이용약관에 동의해야 회원가입이 가능합니다." };
          }
        },
      }}
      signUpAttributes={["email", "nickname"]}
    >
      <App />
    </Authenticator>
  );
}