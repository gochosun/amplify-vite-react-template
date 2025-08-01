// ...생략된 import 부분 동일

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

  // Spinner 스타일
  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "5px solid lightgray",
    borderTop: "5px solid #4caf50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  } as const;

  const spinnerKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* 반응형 스타일 */
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      main {
        padding: 1.5rem;
      }
      h1 {
        font-size: 1.4rem;
      }
      button {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
      }
      ul {
        padding-left: 1rem;
      }
    }

    @media (max-width: 480px) {
      main {
        padding: 1rem;
      }
      h1 {
        font-size: 1.2rem;
      }
      button {
        font-size: 0.85rem;
        padding: 0.3rem 0.6rem;
      }
      li {
        font-size: 0.95rem;
      }
    }

    ul li {
      cursor: pointer;
      margin-bottom: 0.5rem;
    }

    button {
      margin: 0.5rem 0;
      padding: 0.5rem 1rem;
    }
  `;

  return (
    <main>
      <style>{spinnerKeyframes}</style>

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
        <>
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
        </>
      )}
    </main>
  );
}