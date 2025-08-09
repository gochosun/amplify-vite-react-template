import { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { fetchUserAttributes } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

type ViewMode = "list" | "tile";

function App() {
  const { signOut } = useAuthenticator();
  const client = generateClient<Schema>();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("고객님");
  const [viewMode, setViewMode] = useState<ViewMode>("list"); // 기본: 현재 상태(리스트)

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
    }

    h1 {
      font-size: 2rem;
      margin: 0 0 1rem 0;
      text-align: center;
      animation: fade-in 360ms ease-out both;
    }

    /* 상단 우측 배지 */
    .top-row {
      width: 100%;
      display: flex;
      justify-content: space-between; /* 왼쪽 토글, 오른쪽 배지 */
      align-items: center;
      margin: 0.25rem 0 0.5rem 0;
      animation: fade-up 420ms ease-out both;
      gap: 0.75rem;
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

    /* 보기 전환 토글 */
    .view-toggle {
      display: inline-flex;
      border-radius: 999px;
      background: #ffffffb8;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .view-toggle button {
      border: none;
      background: transparent;
      padding: 0.5rem 0.9rem;
      font-size: 0.95rem;
      cursor: pointer;
      color: #0b1220;
      transition: background-color 160ms ease, transform 120ms ease;
    }
    .view-toggle button:hover { background: #eef3ff; }
    .view-toggle button:active { transform: scale(0.98); }
    .view-toggle button[aria-pressed="true"] {
      background: #2f6bff;
      color: #fff;
    }

    button.app {
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
    button.app:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(11,18,32,0.18); }
    button.app:active { transform: translateY(0) scale(0.98); box-shadow: 0 6px 16px rgba(11,18,32,0.12); }

    /* 리스트 모드 */
    ul.todo-list {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: none;
      border: none;
      animation: fade-in 280ms ease-out both;
    }
    li.todo-item {
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
    }
    li.todo-item:hover { transform: translateY(-2px); box-shadow: 0 2px 6px rgba(11,18,32,0.08), 0 10px 22px rgba(11,18,32,0.08); background-color: #f9fbff; }

    /* 타일(그리드) 모드 */
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 0.5rem 0;
      animation: fade-in 280ms ease-out both;
    }
    .tile {
      background: #ffffff;
      color: #0b1220;
      padding: 1rem;
      border-radius: 14px;
      box-shadow: 0 1px 2px rgba(11,18,32,0.06), 0 6px 16px rgba(11,18,32,0.06);
      transition: transform 140ms ease, box-shadow 180ms ease, background-color 180ms ease;
      cursor: pointer;
      min-height: 92px;
      display: flex;
      align-items: flex-start;
    }
    .tile:hover { transform: translateY(-3px); box-shadow: 0 2px 6px rgba(11,18,32,0.08), 0 10px 22px rgba(11,18,32,0.08); background-color: #f9fbff; }
    .tile .title {
      font-weight: 600; 
      line-height: 1.35; 
      word-break: break-word; 
      overflow-wrap: break-word;
    }

    /* 반응형 */
    @media (max-width: 900px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 520px) {
      .grid { grid-template-columns: 1fr; }
    }

    .loading-hint { animation: fade-in 1200ms ease-in-out infinite alternate; opacity: 0.8; }

    @media (max-width: 375px) {
      .content-container { padding: 0 0.25rem; }
      h1 { font-size: 1.4rem; }
      .user-badge { width: 42px; height: 42px; font-size: 0.95rem; }
      button.app { font-size: 1rem; padding: 0.75rem; border-radius: 8px; }
      li.todo-item { font-size: 1rem; padding: 0.9rem; border-radius: 10px; }
    }

    @media (max-width: 480px) {
      .content-container { padding: 0 0.25rem; }
      h1 { font-size: 1.5rem; }
      .user-badge { width: 44px; height: 44px; font-size: 0.95rem; }
      button.app { font-size: 1.05rem; padding: 0.85rem; }
      li.todo-item { font-size: 1.05rem; padding: 0.95rem; }
    }

    @media (max-width: 768px) {
      h1 { font-size: 1.75rem; }
      button.app { font-size: 1.1rem; padding: 1rem; }
      li.todo-item { font-size: 1.1rem; padding: 1rem; }
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
          <p className="loading-hint" style={{ marginTop: "1rem" }}>
            할 일 목록을 불러오는 중입니다...
          </p>
        </div>
      ) : (
        <div className="content-container">
          <h1>{displayName}님, 환영합니다 👋</h1>

          {/* 상단 행: 보기 전환 토글 (좌) / 사용자 배지(우) */}
          <div className="top-row">
            <div className="view-toggle" role="tablist" aria-label="보기 전환">
              <button
                role="tab"
                aria-selected={viewMode === "list"}
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                title="리스트 보기"
              >
                리스트
              </button>
              <button
                role="tab"
                aria-selected={viewMode === "tile"}
                aria-pressed={viewMode === "tile"}
                onClick={() => setViewMode("tile")}
                title="타일 보기"
              >
                타일
              </button>
            </div>

            <div className="user-badge" title={displayName}>
              {avatarText}
            </div>
          </div>

          {/* + new 버튼 */}
          <button className="app" type="button" onClick={(e) => createTodo(e)}>
            + new
          </button>

          {/* 목록/타일 렌더링 */}
          {todos.length === 0 ? (
            <p style={{ animation: "fade-in 280ms ease-out both", opacity: 0.9 }}>
              현재 등록된 할 일이 없습니다.
            </p>
          ) : viewMode === "list" ? (
            <ul className="todo-list">
              {todos.map((todo, idx) => (
                <li
                  className="todo-item"
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
          ) : (
            <div className="grid">
              {todos.map((todo, idx) => (
                <div
                  className="tile"
                  key={todo.id}
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    animation: "fade-up 360ms ease-out both",
                    animationDelay: `${idx * 60}ms`,
                  }}
                >
                  <div className="title">{todo.content}</div>
                </div>
              ))}
            </div>
          )}

          <button className="app" onClick={signOut} style={{ marginTop: "0.75rem" }}>
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
                  style={{ marginTop: "1rem", marginBottom: "1rem", animation: "fade-up 420ms ease-out both" }}
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