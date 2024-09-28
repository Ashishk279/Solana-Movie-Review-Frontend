import { FC, useState, useEffect } from 'react';
import { Card } from './movie-card';
import { Movie } from '@/models/movie-model';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { MovieCoordinator } from '@/coordinator/movie-coordinator';
import { Center, HStack, Spacer, Button, Input } from "@chakra-ui/react";


const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";
export const MovieList: FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const {connection} = useConnection()
  const [movies, setMovies] = useState<Movie[]>([]); // Specify the type here
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('')

  useEffect(() => {
    MovieCoordinator.prefetchAccounts(connection, search)
    MovieCoordinator.fetchPage(connection, page, 10).then(setMovies);
  }, [page, search]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const accounts = await connection.getProgramAccounts(
          new PublicKey(MOVIE_REVIEW_PROGRAM_ID)
        );
        const movies: Movie[] = accounts.reduce(
          (accumulator: Movie[], { account }) => {
            try {
              const movie = Movie.deserialize(account.data);
              if (movie) {
                accumulator.push(movie);
              }
            } catch (error) {
              console.error('Error deserializing movie:', error);
            }
            return accumulator;
          },
          []
        );

        setMovies(movies);

        console.log(movies.length)
        console.log(movies[3117])
      } catch (error) {
        console.error('Error fetching program accounts:', error);
      }
    };

    fetchMovies();
  }, [connection]);

  return (
    <div>
       <Center>
      <Input
        id="search"
        color="gray.400"
        onChange={event => setSearch(event.currentTarget.value)}
        placeholder="Search"
        w="97%"
        mt={2}
        mb={2}
        pt={2}
        pb={2}
        pl={2}
        pr={2}
      />
    </Center>
    {movies.map((movie, i) => (
      <Card key={i} movie={movie} />
    ))}
    <Center>
      <HStack w="full" mt={2} mb={8} ml={4} mr={4}>
        {page > 1 && (
          <Button onClick={() => setPage(page - 1)}>Previous</Button>
        )}
        <Spacer />
        {MovieCoordinator.accounts.length > page * 2 && (
          <Button onClick={() => setPage(page + 1)}>Next</Button>
        )}
      </HStack>
    </Center>
  </div>
  );
};
