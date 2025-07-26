import { useEffect, useState } from "react";
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

export default function AppWrapper() {
  const [agreed, setAgreed] = useState(false);

  return (
    <Authenticator
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <Authenticator.SignUp.FormFields />
                <div style={{ marginTop: '1em' }}>
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
          Footer() {
            return (
              <div style={{ fontSize: '0.8em', marginTop: '1em' }}>
                회원가입을 진행하면 <a href="/terms">이용약관</a> 및 <a href="/privacy">개인정보 처리방침</a>에 동의한 것으로 간주합니다.
              </div>
            );
          },
        },
      }}
      services={{
        async validateCustomSignUp(_formData) {
          if (!agreed) {
            return {
              acknowledgement: '이용약관에 동의해야 합니다.',
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
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}