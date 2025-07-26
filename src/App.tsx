import { useState, useEffect } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>();

export default function AppWrapper() {
  return (
    <Authenticator
      components={{
        SignUp: {
          FormFields() {
            const [agreed, setAgreed] = useState(false); // ✅ 여기로 이동

            // 상태를 저장하는 데 전역 필요 없다면 로컬 선언 권장
            return (
              <>
                <Authenticator.SignUp.FormFields />
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    &nbsp;이용약관에 동의합니다.
                  </label>
                </div>
              </>
            );
          },
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