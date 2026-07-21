// AppContext is intentionally minimal — state is managed in AuthContext and UIContext
export function AppProvider({ children }) {
  return children;
}
export function useApp() {
  return {};
}
