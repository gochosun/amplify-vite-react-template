import { useState, useEffect, useRef } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>();

export default function AppWrapper() {
  // 약관 동의 여부를 ref 로 관리 (렌더링과 무관, validateCustomSignUp 에서 사용 가능)
  const agreedRef = useRef(false);

  return (
    <Authenticator
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <Authenticator.SignUp.FormFields />
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        agreedRef.current = e.target.checked;
                      }}
                    />
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
    >
      <App />
    </Authenticator>
  );
}

function App() {
  const { signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
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

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
            {todo.content}
          </li>
        ))}
      </ul>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}