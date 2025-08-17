'use client';

import RedisStatus from '@/components/redis-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function RedisTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Redis Connection Test</h1>
          <p className="text-gray-600">Test your Redis connection and caching functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RedisStatus />
          
          <Card>
            <CardHeader>
              <CardTitle>Cache Test</CardTitle>
            </CardHeader>
            <CardContent>
              <CacheTestForm />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Redis Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Connection String:</strong> redis://default:VisW44x7I3mYKXHlUzvpMiJT2X7wRuY0qG6XDxVjHZq7f59Af0W1qbxw4SDRqRPP@5.189.130.31:4444/1</p>
              <p><strong>Host:</strong> 5.189.130.31</p>
              <p><strong>Port:</strong> 4444</p>
              <p><strong>Database:</strong> 1</p>
              <p><strong>Authentication:</strong> default:VisW44x7I3mYKXHlUzvpMiJT2X7wRuY0qG6XDxVjHZq7f59Af0W1qbxw4SDRqRPP</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CacheTestForm() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState('3600');
  const [result, setResult] = useState('');

  const handleSet = async () => {
    try {
      const response = await fetch('/api/redis/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ttl: parseInt(ttl) }),
      });
      
      const data = await response.json();
      setResult(data.success ? `✅ Cached successfully with TTL: ${ttl}s` : `❌ Failed to cache: ${data.error}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  const handleGet = async () => {
    try {
      const response = await fetch(`/api/redis/cache?key=${encodeURIComponent(key)}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(data.value ? `📖 Retrieved: ${JSON.stringify(data.value)}` : '❌ Key not found');
      } else {
        setResult(`❌ Failed to get: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/redis/cache?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      setResult(data.success ? '🗑️ Key deleted successfully' : `❌ Failed to delete: ${data.error}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  const handleClear = async () => {
    try {
      const response = await fetch('/api/redis/cache?clearAll=true', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      setResult(data.success ? '🧹 Cache cleared successfully' : `❌ Failed to clear cache: ${data.error}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Cache Key</label>
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter cache key"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Cache Value</label>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter cache value"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">TTL (seconds)</label>
        <Input
          type="number"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
          placeholder="3600"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={handleSet} variant="default" size="sm">
          Set Cache
        </Button>
        <Button onClick={handleGet} variant="outline" size="sm">
          Get Cache
        </Button>
        <Button onClick={handleDelete} variant="outline" size="sm">
          Delete Key
        </Button>
        <Button onClick={handleClear} variant="destructive" size="sm">
          Clear All
        </Button>
      </div>
      
      {result && (
        <div className="p-3 bg-gray-50 border rounded-lg">
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  );
}
