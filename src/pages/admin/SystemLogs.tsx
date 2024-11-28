import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { fetchSystemLogs, SystemLog } from '../../services/api';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface LogEntry {
  _id: string;
  level: string;
  message: string;
  timestamp: string;
  user?: string;
  action?: string;
  details?: any;
}

const SystemLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  // Check for admin access
  const adminRoles = ['admin', 'superadmin'];
  if (!user || !adminRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await fetchSystemLogs(filter);
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load system logs');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [filter]);

  if (loading) return <Typography>Loading logs...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        System Logs
      </Typography>

      <FormControl sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>Filter</InputLabel>
        <Select
          value={filter}
          label="Filter"
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="error">Errors</MenuItem>
          <MenuItem value="warning">Warnings</MenuItem>
          <MenuItem value="info">Info</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>{log.level}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.action || '-'}</TableCell>
                <TableCell>{log.user || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SystemLogs;
