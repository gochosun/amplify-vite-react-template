import { useState, useEffect, useRef } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";

function App() {
  const { signOut, user } = useAuthenticator();
  const client = generateClient<Schema>();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = (user as any)?.attributes?.name || "고객님";

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        setTodos([...data.items]);
        setIsLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
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
      background: linear-gradient(to bottom, #8e58e0, #e6dcf6);
      min-height: 100vh;
      font-family: sans-serif;
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
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      text-align: center;
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
      .content-container {
        padding: 0 0.25rem;
      }
      h1 {
        font-size: 1.4rem;
      }
      button {
        font-size: 1rem;
        padding: 0.75rem;
      }
      li {
        font-size: 1rem;
        padding: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .content-container {
        padding: 0 0.25rem;
      }
      h1 {
        font-size: 1.5rem;
      }
      button {
        font-size: 1.05rem;
        padding: 0.85rem;
      }
      li {
        font-size: 1.05rem;
        padding: 0.85rem;
      }
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.75rem;
      }
      button {
        font-size: 1.1rem;
        padding: 1rem;
      }
      li {
        font-size: 1.1rem;
        padding: 1rem;
      }
    }
  `;

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
          <button onClick={createTodo}>+ new</button>

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
      signUpAttributes={["email"]}
    >
      <App />
    </Authenticator>
  );
}