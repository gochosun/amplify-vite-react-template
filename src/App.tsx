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

  // 🔵 CSS Spinner 스타일 정의
  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "5px solid lightgray",
    borderTop: "5px solid #4caf50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "40px auto",
  } as const;

  const spinnerKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <main>
      <style>{spinnerKeyframes}</style>

      <h1>{displayName}님, 환영합니다 👋</h1>
      <button onClick={createTodo}>+ new</button>

      {isLoading ? (
        <div style={spinnerStyle}></div>
      ) : todos.length === 0 ? (
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
                  <label htmlFor="agreeTerms">
                    &nbsp;이용약관에 동의합니다.
                  </label>
                </div>
              </>
            );
          },
          Footer() {
            return (
              <div style={{ fontSize: "0.8rem", marginTop: "1rem" }}>
                회원가입을 진행하면{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  이용약관
                </a>{" "}
                및{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  개인정보처리방침
                </a>
                에 동의한 것으로 간주합니다.
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