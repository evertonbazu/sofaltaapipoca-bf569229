import { useState, useEffect } from 'react';
import { useDebounced } from '../../hooks/useDebounced';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { MovieCard } from '../../components/MovieCard';
import { Container, Content } from './styles';

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
