import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { MovieCard } from '../../components/MovieCard';

// Estilos incorporados diretamente no arquivo
const Container = styled.div`
  width: 100%;
  height: 100vh;
`;

const Content = styled.div`
  padding: 40px 120px;

  .search-container {
    width: 100%;
    margin-bottom: 40px;

    input {
      width: 100%;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      background: ${({ theme }) => theme.COLORS.GRAY_800};
      color: ${({ theme }) => theme.COLORS.WHITE};
      font-size: 16px;

      &::placeholder {
        color: ${({ theme }) => theme.COLORS.GRAY_400};
      }
    }
  }

  main {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

// Hook de debounce incorporado
function useDebounced(callback, delay) {
  const [debouncedCallback, setDebouncedCallback] = useState(() => callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);

  return debouncedCallback;
}

export function Home() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchMovies() {
      const response = await api.get('/movies');
      setMovies(response.data);
      setFilteredMovies(response.data);
    }

    fetchMovies();
  }, []);

  const handleSearch = useDebounced((e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);
    
    if (term === '') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(term)
      );
      setFilteredMovies(filtered);
    }
  }, 300);

  return (
    <Container>
      <Header />
      <Content>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar filme pelo nome"
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>

        <main>
          {filteredMovies.map(movie => (
            <MovieCard 
              key={String(movie.id)}
              data={movie}
            />
          ))}
        </main>
      </Content>
    </Container>
  );
}
