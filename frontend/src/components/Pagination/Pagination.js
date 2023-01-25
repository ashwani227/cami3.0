import React, { useState } from 'react';
import './Pagination.css';

const Pagination = ({ recordsPerPage, totalRecords, pageLimit = 5, currentPage, handlePagination }) => {

    const [totalPages, setTotalPages] = useState();

    React.useEffect(() => {
        if (!totalPages) {
            setTotalPages(Math.ceil(parseInt(totalRecords) / parseInt(recordsPerPage)))
        }
    }, [totalPages, recordsPerPage, totalRecords])

    const goToNextPage = () => {
        const index = currentPage + 1;
        if (index > totalPages) {
            return;
        }

        handlePagination(index)
    }

    const goToPreviousPage = () => {
        const index = currentPage - 1;
        if (index <= 0) {
            return;
        }

        handlePagination(index)
    }

    const updatePageNumber = (event) => {
        const pageNumber = Number(event.target.textContent);
        handlePagination(pageNumber)
    }

    const getPaginationGroup = () => {

        const validatePageLimit = pageLimit > totalPages ? totalPages : pageLimit;
        const half = Math.floor(validatePageLimit / 2);
        let to = validatePageLimit;

        if (currentPage + half >= totalPages) {
            to = totalPages;
        } else if (currentPage > half) {
            to = currentPage + half;
        }

        let from = to - validatePageLimit;

        return Array.from({ length: validatePageLimit }, (_, i) => (i + 1) + from);
    };

    if (totalPages) {
        return (
            <div className='d-flex align-items-center justify-content-center'>
                <button className='btn btn-sm' onClick={goToPreviousPage} disabled={currentPage === 1}>Prev</button>
                {getPaginationGroup().map((item, index) => (
                    <button key={index} className={`btn btn-sm ${currentPage === item ? 'btn-primary' : null}`} onClick={updatePageNumber} disabled={currentPage === item}>
                        <span>{item}</span>
                    </button>
                ))}
                <button className='btn btn-sm' onClick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
            </div>
        );
    } else {
        return (<div className='d-flex align-items-center justify-content-center pagination-data'></div>)
    }
};

export default Pagination;