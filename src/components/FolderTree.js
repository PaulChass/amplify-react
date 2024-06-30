import React, { useEffect, useState } from 'react';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import CreateFolder from '../components/CreateFolder';
import FileList from '../components/FilesList';
import { useLocation } from 'react-router-dom';
import DownloadFolder from './DownloadFolder';
import DeleteFolder from './DeleteFolder';
import RenameFolder from './RenameFolder';
import CreateShareableLink from './CreateShareableLink';
import '../css/FolderTree.css';
import { Container, Row, Col, Button, Card, Dropdown, Spinner } from 'react-bootstrap';


const FolderTree = () => {
    const [folders, setFolders] = useState([]);
    const [folderId, setFolderId] = useState(null);
    const [folderName, setFolderName] = useState('My drive');
    const [shareFolderId, setShareFolderId] = useState(null);
    const [shareFolderName, setShareFolderName] = useState('S');
    const [isLoading, setIsLoading] = useState(false);

    const [loggedIn, setLoggedIn] = useState(false);
    const [updated, setUpdated] = useState(false);
    const location = useLocation();
    const [showCreateLink, setShowCreateLink] = useState(false);
    const [showRename, setShowRename] = useState(false);
    const [showRenameId, setShowRenameId] = useState(null);


    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    useEffect(() => {
        fetchFolders();
    }, [folderId, location.pathname, folderName, updated]);

    const fetchFolders = async () => {
        try {
            const response = await api.get(`${baseUrl}/folders/${folderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true // If sending cookies is necessary
            });
            setFolders(response.data);
            setLoggedIn(true);
            setUpdated(false);
            setShowCreateLink(false);
            setShowRename(false);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };




    const handleClick = (id, type = 'null') => {
        switch (type) {
            case 'createLink':
                if (showCreateLink == true) {
                    setShowCreateLink(false);
                } else {
                    setShareFolderId(id);
                    setShareFolderName(folders.find(folder => folder.id === id).name);
                    setShowCreateLink(true);
                }
                break;


            case 'rename':
                setShowRenameId(id);
                setShowRename(true);
                break;



            default:
                if(!showRename){
                setFolderId(id);
                let newFolder = folders.find(folder => folder.id === id).name
                setFolderName(folderName + '  >  ' + newFolder);}             
                break;
        }
    };

    const findParentFolderId = (folders, id) => {
        const folder = folders.find(folder => folder.id === id);
        if (folder) {
            return folder.parent_id
        }
    };

    const handleBackClick = () => {
        const id = findParentFolderId(folders, folderId);
        setFolderId(id);
        if (id === null) {
            setFolderName('My drive');
        }
        else {
            let oldFolder = folderName.split(' > ').slice(0, -1).join(' > ');
            setFolderName(oldFolder);
        }
    }


    //Check if current folder is root folder
    let isNotRootFolder = true;
    if (folderId === null) { isNotRootFolder = false; }
    for (let index = 0; index < folders.length; index++) {
        if (folders[index].parent_id == folderId && folders[index].parent_id == null) {
            isNotRootFolder = false;
        }
    }


    const renderFolders = (folders) => {
        return folders
            .filter(folder => folder.parent_id === folderId)
            .map(folder => (
                <div key={folder.id}>
                    <div className='flexCenter'>
                        <Card className="folder" onClick={() => handleClick(folder.id)} style={{ width: '18rem' }}>
                            <Card.Body>
                                <Card.Title>
                                    {(showRename && showRenameId == folder.id) ? <RenameFolder folderId={folder.id} setFolders={setFolders} setUpdated={setUpdated} folderName={folder.name} /> :
                                        folder.name}</Card.Title>
                            </Card.Body>
                        </Card>
                        <Dropdown >
                            <Dropdown.Toggle variant="dark" id="dropdown-basic">
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item >
                                    <DownloadFolder folderId={folder.id} isLoading={isLoading} setIsLoading={setIsLoading} setShowRename={setShowRename} />
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <DeleteFolder folderId={folder.id} setFolders={setFolders} />
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleClick(folder.id, 'createLink')}>
                                    Share
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleClick(folder.id, 'rename')}>
                                    Rename
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            ));
    };

    if (!loggedIn) {
        return (<div>
            <h2 className='driveTitle'>My drive</h2>
            <p>You need to Sign In to access your drive
                <a href='/login' style={{ marginLeft: '10px', marginRight: '10px' }} >Sign in</a>
                <a href='/register'>Register</a></p>
        </div>);
    } else {
        return (
            <Container>
                <Row>
                    <Col><h2 className='driveTitle'>Welcome to your drive</h2></Col>
                </Row>
                <Row className="folders">

                    <h3 id='folderName'>{folderName}</h3>
                    {isNotRootFolder && <Button variant='secondary' style={{ width: '100%', marginTop: '3rem', marginBottom: '2rem' }} onClick={() => handleBackClick(folderId)}>...</Button>}

                    {renderFolders(folders)}
                    <CreateFolder setFolders={setFolders} folderId={folderId} />

                    <FileList folderId={folderId} isNotRootFolder={isNotRootFolder} />
                    {showCreateLink && <CreateShareableLink folderId={shareFolderId} folderName={shareFolderName} />}
                    {isLoading &&
                        <span>Loading please wait...<Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner></span>}
                </Row>

            </Container>
        );
    }
};

export default FolderTree;