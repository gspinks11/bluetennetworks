// src/App.tsx
import React, { useState } from 'react'; // Keep useState for search
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'; // Don't forget to import the styles!
import './App.css'; // Keep your existing App.css import

import awsExports from './aws-exports';
console.log('AWS Amplify config:', awsExports);

// --- CORRECTED AMPLIFY IMPORTS FOR v5.x.x ---
// In v5, Amplify, Auth, and API are directly exported from the top-level 'aws-amplify' package
//import { Amplify } from 'aws-amplify';
import {fetchAuthSession } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
// --- END: CORRECTED AMPLIFY IMPORTS FOR v5.x.x ---

// REMOVED: All custom authentication state (username, password, step, etc.)
// REMOVED: All custom authentication handlers (handleSignIn, handleSignUp, etc.)
// REMOVED: The useEffect for Auth.currentAuthenticatedUser()
// Because the <Authenticator> component handles all of these internally.

function App() {
  // --- STATE FOR SEARCH FUNCTIONALITY (Keep these) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  // --- SEARCH FUNCTION (Updated to manually inject token) ---
  const handleSearch = async () => {
    setLoadingSearch(true);
    setSearchError('');
    setSearchResults([]); // Clear previous results

    try {
      // --- START: MANUALLY FETCH AND INJECT TOKEN ---
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString(); // Extract the ID token (JWT)

      if (!idToken) {
        setSearchError('Could not retrieve ID token. Please sign in again.');
        setLoadingSearch(false);
        return;
      }

      // Define custom headers for the API call
      const headers = {
        Authorization: `Bearer ${idToken}`, // <--- Manually add the Bearer token
      };
      // --- END: MANUALLY FETCH AND INJECT TOKEN ---

      const path = `/cases?defendant_name=${encodeURIComponent(searchTerm)}`;

      console.log(`Calling API: ${path}`);
      console.log(`Authorization Header: Bearer ${idToken.substring(0, 30)}...`); // Log part of token for debug

      // Pass the headers object to the API.get call
      const response = await get({
        apiName: 'CaseSenseAPI',
        path,
        options: { headers }
      }).response;
      const apiResponse = await response.body.json();

      console.log('API Response:', apiResponse);
      if (Array.isArray(apiResponse)) {
        setSearchResults(apiResponse);
      } else {
        setSearchError('Invalid API response format. Expected an array.');
      }

    } catch (error) {
      console.error('Error during API search:', error);
      // Important: Log the specific error from Auth if token retrieval fails
      if ((error as any).name === 'NoSignInUserException') {
          setSearchError('Search Error: You are not signed in or your session has expired. Please sign in again.');
      } else if ((error as any).message && (error as any).message.includes('token')) {
          setSearchError(`Search Error: Token issue: ${ (error as any).message }`);
      } else {
          setSearchError(`Search Error: ${(error as any).message || String(error)}`);
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // The Authenticator component will handle conditional rendering based on authentication state
  // If the user is NOT logged in, Authenticator will show its login/signup forms.
  // If the user IS logged in, Authenticator will render its children ({ signOut, user }) => (...)
  return (
    <Authenticator>
      {({ signOut, user }) => ( // 'user' and 'signOut' are provided by Authenticator
        <div className="App">
          {/* --- START: MOVED SEARCH SECTION TO TOP --- */}
          {/* Added some margin/padding/border to visually separate it */}
          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#1a1a1a', color: '#ffffff', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
            <h2>Search Court Cases</h2>
            {/* Search input field */}
            <input
              type="text"
              placeholder="Search by Defendant Name (e.g., TENOR)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 'calc(100% - 22px)', padding: '10px', margin: '8px 0', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#333', color: '#fff' }}
            />
            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={loadingSearch}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {loadingSearch ? 'Searching...' : 'Search'}
            </button>

            {/* Display search errors */}
            {searchError && <p style={{ color: 'red', marginTop: '10px' }}>{searchError}</p>}

            {/* Display search results (this conditional rendering means it's usually not visible immediately) */}
            {searchResults.length > 0 && (
              <div style={{ marginTop: '20px', textAlign: 'left', backgroundColor: '#333', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ color: '#fff' }}>Search Results ({searchResults.length} found):</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #555', padding: '10px', borderRadius: '4px', backgroundColor: '#444' }}>
                  {searchResults.map((caseItem, index) => (
                    <div key={caseItem.case_id || index} style={{ borderBottom: '1px solid #666', padding: '10px 0', marginBottom: '10px', color: '#eee' }}>
                      <p><strong>Case ID:</strong> {caseItem.case_id}</p>
                      <p><strong>Case Number:</strong> {caseItem.summary_case_number}</p>
                      <p><strong>Clerk File Date:</strong> {caseItem.clerk_file_date}</p>
                      <p><strong>Total Fees Due:</strong> ${caseItem.total_fees_due?.toFixed(2)}</p>
                      <p><strong>Parties:</strong> {caseItem.parties_json && caseItem.parties_json.map((p: any) => `${p.TYPE}: ${p['PARTY NAME']}`).join('; ')}</p>
                      <p><strong>Charges:</strong> {caseItem.charges_json && caseItem.charges_json.map((c: any) => c.Description).join('; ')}</p>
                      {caseItem.url && <p><a href={caseItem.url} target="_blank" rel="noopener noreferrer" style={{ color: '#88aaff' }}>View Full Details</a></p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {searchResults.length === 0 && !loadingSearch && searchTerm && !searchError && (
              <p style={{ color: '#ccc', marginTop: '10px' }}>No results found for "{searchTerm}".</p>
            )}
          </div>
          {/* --- END: MOVED SEARCH SECTION --- */}

          <header className="App-header">
            <h1>Case Sense - Court Case Notification System</h1>
            <h2>Welcome, {user?.username}!</h2>
            <p>You are successfully logged in to the application.</p>
            <button
              onClick={signOut}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', margin: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Sign Out
            </button>
          </header>
        </div>
      )}
    </Authenticator>
  );
}

export default App;