import React from 'react';
import { useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';

export default function ErrorPage() {
  const { code } = useParams();
  const statusCode = parseInt(code || '404', 10);
  return <ErrorState code={statusCode} />;
}
