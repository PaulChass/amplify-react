import React, { useEffect, useState } from 'react';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { useParams } from 'react-router-dom';
import DownloadFolder from '../components/DownloadFolder';
import FileUpload from '../components/FileUpload';
import CreateFolder from '../components/CreateFolder';
import DownloadFile from '../components/DownloadFile';
import DeleteFile from '../components/DeleteFile.js';
import DeleteFolder from '../components/DeleteFolder';
import RenameFolder from '../components/RenameFolder';
import RenameFile from '../components/RenameFile.js';
import CreateShareableLink from '../components/CreateShareableLink';


import { Container, Row, Col, Button, Card, Dropdown, Spinner } from 'react-bootstrap';



const ShareableLinkPage = ({ }) => {
  const { token } = useParams();
  const [thisFolder, setThisFolder] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('');
  const [updated, setUpdated] = useState(false);
  const [isRootFolder, setIsRootFolder] = useState(true);
  const [shareFolderId, setShareFolderId] = useState(null);
  const [shareFolderName, setShareFolderName] = useState('root');
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  localStorage.setItem('tokenUrl', token);
  const authToken = localStorage.getItem('token');

  useEffect(() => {
    fetchFolder();
  }, [token, updated]);

  const fetchFolder = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        withCredentials: true
      };
      const response = await api.get(`${baseUrl}/shareable-links/${token}`, config);
      setType(response.data.type);
      setThisFolder(response.data.folder);
      setFolders(response.data.folders);
      setFiles(response.data.files);
      setUpdated(false)

    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const renderFolders = (folders) => {
    return folders
      .filter(folder => folder.parent_id === thisFolder.id)
      .map(folder => (
        <div key={folder.id} className='flexCenter'>
          <div style={{ display: 'flex' }}>
            <Card className="folder" onClick={() => handleClick(folder.id)} style={{ width: '18rem' }}>
              <Card.Body>
                <Card.Title>{folder.name}</Card.Title>
              </Card.Body>
            </Card>
            <Dropdown >
              <Dropdown.Toggle variant="dark" id="dropdown-basic">

              </Dropdown.Toggle>

              <Dropdown.Menu>
              <Dropdown.Item >
                  <DownloadFolder folderId={folder.id} isLoading={isLoading} setIsLoading={setIsLoading} />
                </Dropdown.Item>
                <Dropdown.Item >
                  <DeleteFolder folderId={folder.id} setFolders={setFolders} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleCreateLinkClick(folder.id)}>                    
                               Share
                            </Dropdown.Item>
                <Dropdown.Item>
                  <RenameFolder folderId={folder.id} setFolders={setFolders} setUpdated={setUpdated} />
                </Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      ));
  };

  const renderFiles = (files) => {
    return files
      .filter(file => file.folder_id === thisFolder.id)
      .map(file => (
        <div key={file.id} className='flexCenter'>

          <span style={{ marginRight: '1rem' }}>{file.name}</span>
          <Dropdown >
            <Dropdown.Toggle variant="dark" id="dropdown-filelist">
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item >
                <DownloadFile file={file} isLoading={isLoading} setIsLoading={setIsLoading} />
              </Dropdown.Item>
              <Dropdown.Item >
                <DeleteFile fileId={file.id} setFiles={setFiles} />
              </Dropdown.Item>
              <Dropdown.Item>
                <RenameFile fileId={file.id} setFiles={setFiles} />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

      ));
  };

  const handleClick = (id) => {
    let newFolder = folders.find(folder => folder.id === id);
    setThisFolder(newFolder);
    setIsRootFolder(false);
  };

  const handleBackClick = () => {
    let newFolder = folders.find(folder => folder.id === thisFolder.parent_id);
    if (newFolder) { setThisFolder(newFolder) }
    else {
      setUpdated(true);
      setIsRootFolder(true);
    };
    ;
  }

  const handleCreateLinkClick = (id) => {
    if (showCreateLink == true) {
      setShowCreateLink(false);
    } else {
      setShareFolderId(id);
      setShareFolderName(folders.find(folder => folder.id === id).name);
      setShowCreateLink(true);
    }
  };

  let empty = thisFolder.length == 0;
  return (
    <div>
      <h2 className='driveTitle'>Shared drive</h2>
      {empty &&
        <h3>This folder is private you need to log in to access its content
          <a style={{ marginLeft: '20px' }} href="/login">Sign in</a>
          <a style={{ marginLeft: '20px' }} href="/Register">Sign up</a></h3>}
      <div className="folders">
        <h3>{thisFolder.name}</h3>
        {!isRootFolder && <button onClick={() => handleBackClick()}>...</button>}
        <ul cl>{renderFolders(folders)}</ul>
        {!empty && <CreateFolder setFolders={setFolders} folderId={thisFolder.id} />}

        <ul>{renderFiles(files)}</ul>
        {!empty && <FileUpload folderId={thisFolder.id} linkToken={token} setUpdated={setUpdated} setIsRootFolder={setIsRootFolder} />}
        {showCreateLink && <CreateShareableLink folderId={shareFolderId} folderName={shareFolderName} />}

        {isLoading &&
          <span>Loading please wait...<Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner></span>}
      </div>




    </div>
  );
};



export default ShareableLinkPage;
