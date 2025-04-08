-- Create database
CREATE DATABASE SIULibrary;
USE SIULibrary;

-- 1. Create SIULIBRARY Table
CREATE TABLE SIULIBRARY (
    Slid INT PRIMARY KEY, 
    Iname VARCHAR(255) NOT NULL, 
    location VARCHAR(255) NOT NULL, 
    noofbranches INT
);

-- 2. Create Ilibrary Table
CREATE TABLE Ilibrary (
    Lid INT PRIMARY KEY, 
    Lname VARCHAR(255) NOT NULL, 
    city VARCHAR(255) NOT NULL, 
    Area VARCHAR(255) NOT NULL, 
    Slid INT, 
    FOREIGN KEY (Slid) REFERENCES SIULIBRARY(Slid)
);

-- 3. Create BOOKS Table
CREATE TABLE BOOKS (
    Bid INT PRIMARY KEY, 
    Bname VARCHAR(255) NOT NULL, 
    Price DECIMAL(10, 2) NOT NULL, 
    Lid INT, 
    FOREIGN KEY (Lid) REFERENCES Ilibrary(Lid)
);

-- 4. Create Noofcopies Table
CREATE TABLE Noofcopies (
    Bnid INT PRIMARY KEY, 
    Bid INT, 
    Blid INT, 
    FOREIGN KEY (Bid) REFERENCES BOOKS(Bid), 
    FOREIGN KEY (Blid) REFERENCES Ilibrary(Lid)
);

-- 5. Create AUTHOR Table
CREATE TABLE AUTHOR (
    Aid INT PRIMARY KEY, 
    Aname VARCHAR(255) NOT NULL, 
    Email VARCHAR(255), 
    Phoneno VARCHAR(15)
);

-- 6. Create Writes Table
CREATE TABLE Writes (
    Bid INT, 
    Aid INT, 
    Pid INT, 
    PRIMARY KEY (Bid, Aid), 
    FOREIGN KEY (Bid) REFERENCES BOOKS(Bid), 
    FOREIGN KEY (Aid) REFERENCES AUTHOR(Aid)
);

-- 7. Create PUBLISHER Table
CREATE TABLE PUBLISHER (
    Pid INT PRIMARY KEY, 
    Pname VARCHAR(255) NOT NULL
);

-- 8. Create SELLER Table
CREATE TABLE SELLER (
    Sid INT PRIMARY KEY, 
    SIname VARCHAR(255) NOT NULL, 
    City VARCHAR(255) NOT NULL
);

-- 9. Create DEPARTMENT Table
CREATE TABLE DEPARTMENT (
    Deptid INT PRIMARY KEY, 
    Deptname VARCHAR(255) NOT NULL, 
    Institute_name VARCHAR(255) NOT NULL, 
    Lid INT, 
    FOREIGN KEY (Lid) REFERENCES Ilibrary(Lid)
);

-- 10. Create STUDENT Table
CREATE TABLE STUDENT (
    Stid INT PRIMARY KEY, 
    Sname VARCHAR(255) NOT NULL, 
    Email VARCHAR(255), 
    Memid INT, 
    Deptid INT, 
    FOREIGN KEY (Deptid) REFERENCES DEPARTMENT(Deptid)
);

-- 11. Create STAFF Table
CREATE TABLE STAFF (
    Staid INT PRIMARY KEY, 
    Stname VARCHAR(255) NOT NULL, 
    Email VARCHAR(255), 
    Deptid INT, 
    Memid INT, 
    FOREIGN KEY (Deptid) REFERENCES DEPARTMENT(Deptid)
);

-- 12. Create PURCHASE Table
CREATE TABLE PURCHASE (
    Prid INT PRIMARY KEY, 
    Lid INT, 
    Sid INT, 
    Pid INT, 
    Bid INT, 
    Quantity INT, 
    Date DATE, 
    Totalcost DECIMAL(10, 2), 
    FOREIGN KEY (Lid) REFERENCES Ilibrary(Lid), 
    FOREIGN KEY (Sid) REFERENCES SELLER(Sid), 
    FOREIGN KEY (Pid) REFERENCES PUBLISHER(Pid), 
    FOREIGN KEY (Bid) REFERENCES BOOKS(Bid)
);

-- 13. Create ISSUE Table
CREATE TABLE ISSUE (
    Issueid INT PRIMARY KEY, 
    Memid INT, 
    Bid INT, 
    Bnid INT, 
    Lid INT, 
    Issuedate DATE, 
    Returndate DATE, 
    FOREIGN KEY (Memid) REFERENCES Member(Memid), 
    FOREIGN KEY (Bid) REFERENCES BOOKS(Bid), 
    FOREIGN KEY (Lid) REFERENCES Ilibrary(Lid)
);

-- 14. Create SELLS Table
CREATE TABLE SELLS (
    Sid INT, 
    Bid INT, 
    Pid INT, 
    PRIMARY KEY (Sid, Bid), 
    FOREIGN KEY (Sid) REFERENCES SELLER(Sid), 
    FOREIGN KEY (Bid) REFERENCES BOOKS(Bid), 
    FOREIGN KEY (Pid) REFERENCES PUBLISHER(Pid)
);

-- 15. Create Employee Table
CREATE TABLE Employee (
    Empid INT PRIMARY KEY, 
    Empname VARCHAR(255) NOT NULL, 
    Email VARCHAR(255), 
    Salary DECIMAL(10, 2), 
    Lid INT, 
    FOREIGN KEY (Lid) REFERENCES Ilibrary(Lid)
);

-- 16. Create A_specialization Table
CREATE TABLE A_specialization (
    Spec_id INT PRIMARY KEY, 
    Aid INT, 
    Spec_name VARCHAR(255) NOT NULL, 
    FOREIGN KEY (Aid) REFERENCES AUTHOR(Aid)
);

-- 17. Create Member Table
CREATE TABLE Member (
    Memid INT PRIMARY KEY, 
    Lid INT, 
    FOREIGN KEY (Lid) REFERENCES Ilibrary(Lid)
);

-- Insert data into all tables
-- SIULIBRARY
INSERT INTO SIULIBRARY (Slid, Iname, Location, Noofbranches) VALUES (1, 'Pune Central Library', 'Pune', 10);

-- Ilibrary
INSERT INTO Ilibrary (Lid, Lname, city, Area, Slid) VALUES
(1, 'SITLib', 'Pune', 'Lavale', 1),
(2, 'SIBMLib', 'Pune', 'Lavale', 1),
(3, 'SSACLib', 'Nagpur', 'Ramnagar', 1),
(4, 'SSLALib', 'Pune', 'Vimannagar', 1),
(5, 'SIBMBLib', 'Bangalore', 'Jaynagar', 1),
(6, 'SITMHLib', 'Hyderabad', 'Banjara Hills', 1),
(7, 'SIOMLib', 'Pune', 'S.B.Road', 1),
(8, 'SITMNLib', 'Noida', 'Golf course area', 1),
(9, 'SSLAHLib', 'Hyderabad', 'Gacchibowli', 1),
(10, 'SSBSLib', 'Pune', 'Tithnagar', 1);

-- BOOKS
INSERT INTO BOOKS (Bid, Bname, Price, Lid) VALUES
(1, 'Operating System', 1000, 1),
(2, 'Management System', 2500, 2),
(3, 'Supply chain management', 500, 8),
(4, 'Bioinformatics', 780, 10),
(5, 'Tele informatics', 4567, 10),
(6, 'IP and Patents formation', 345, 4),
(7, 'Engineering Graphics', 2456, 1),
(8, 'Customer Management', 3467, 5),
(9, 'Buying Pattern Analysis', 456, 8),
(10, 'Digital Finance', 600, 8),
(11, 'Telecommunication', 1500, 6),
(12, 'Algorithms', 6754, 1),
(13, 'Child Law', 1800, 4),
(14, 'Multimanagers', 2345, 2),
(15, 'MicroEconomics', 267, 5),
(16, 'Electronics', 2341, 1),
(17, 'Structure foundations', 1700, 3),
(18, 'Ecohomes', 1234, 3),
(19, 'Mobile Communication', 456, 6),
(20, 'Labor Laws', 3452, 9),
(21, 'Copyrights', 2789, 9),
(22, 'Research Laws', 1100, 9),
(23, 'DBMS', 700, 1),
(24, 'Computer networks', 3451, 1);

-- Noofcopies
INSERT INTO Noofcopies (Bnid, Bid, Blid) VALUES
(1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 3, 1), (5, 3, 2), (6, 3, 3),
(7, 2, 1), (8, 2, 2), (9, 4, 1), (10, 4, 2), (11, 4, 3), (12, 5, 1),
(13, 5, 2), (14, 6, 1), (15, 7, 1), (16, 8, 1), (17, 8, 2), (18, 9, 1),
(19, 10, 1), (20, 11, 1), (21, 12, 1), (22, 12, 2), (23, 13, 1), (24, 13, 2),
(25, 14, 1), (26, 14, 2), (27, 14, 4), (28, 15, 1), (29, 15, 2), (30, 16, 1),
(31, 16, 2), (32, 17, 1);

-- AUTHOR
INSERT INTO AUTHOR (Aid, Aname, Email, Phoneno) VALUES
(1, 'Shruti', 'abc@gmail.com', '6447896542'),
(2, 'Shivam Kapoor', 'adf@gmail.com', '2345778998'),
(3, 'Ameya', 'ert@gmail.com', '23456789087'),
(4, 'Pooja Pai', 'edr@gmail.com', '32554565678'),
(5, 'Brian Kernighan', 'rtyu@gmail.com', '2143454657'),
(6, 'Ken Thompson', 'errt@gmail.com', '2343454565');

-- Writes
INSERT INTO Writes (Bid, Aid, Pid) VALUES
(1, 1, 2), (2, 2, 3), (3, 5, 2), (4, 6, 4), (5, 1, 5), (6, 1, 2),
(7, 4, 1), (8, 2, 2), (9, 5, 5), (10, 6, 4), (11, 1, 1), (12, 4, 2),
(13, 5, 5), (14, 6, 2), (15, 3, 1), (16, 4, 2), (17, 6, 5), (18, 2, 4),
(19, 5, 1), (20, 1, 2), (21, 3, 5), (22, 5, 2), (23, 6, 1), (24, 3, 3);

-- PUBLISHER
INSERT INTO PUBLISHER (Pid, Pname) VALUES 
(1, 'Tata Maegraw hill'), (2, 'Pragati book store'), 
(3, 'Prentice Hall'), (4, 'OReilly'), (5, 'Emerald publishing');

-- SELLER
INSERT INTO SELLER (Sid, SIname, City) VALUES 
(1, 'Kohinoor', 'Pune'), (2, 'Shiksha', 'Pune'), 
(3, 'ABP', 'Noida'), (4, 'Technical', 'Hyderabad'), 
(5, 'Timenovta', 'Bangalore'), (6, 'Kirti', 'Pune');

-- DEPARTMENT
INSERT INTO DEPARTMENT (Deptid, Deptname, Institute_name, Lid) VALUES
(1, 'Civil', 'SIT', 1), (2, 'E&TC', 'SIT', 1), (3, 'Biology', 'SSBS', 10),
(4, 'Law', 'SSLA', 4), (5, 'Structure', 'SSAC', 3), 
(6, 'Finance management', 'SIBM', 2), 
(7, 'Digital Telecommunications', 'SITMH', 6), 
(8, 'Clinical Research', 'SSBS', 10);

-- STUDENT
INSERT INTO STUDENT (Stid, Sname, Email, Memid, Deptid) VALUES
(1, 'Pooja', 'aswq@gmail.com', 1, 1), (2, 'Satish', 'azsx@gmail.com', 16, 1),
(3, 'Amar', 'cvnn@gmail.com', 13, 2), (4, 'Meera', 'lkio@gmail.com', 44, 2),
(5, 'Ravi', 'fghj@gmail.com', 35, 2), (6, 'Adit', 'cfgb@gmail.com', 26, 3);

-- Member
INSERT INTO Member (Memid, Lid) VALUES 
(1, 1), (16, 1), (13, 1), (44, 1), (35, 1), (26, 10), 
(45, 1), (23, 10), (12, 3), (78, 1), (49, 4), (50, 1);

-- STAFF
INSERT INTO STAFF (Staid, Stname, Email, Memid, Deptid) VALUES 
(1, 'Satish', 'sddf@gmail.com', 45, 1), (2, 'Rachit', 'zxzxc@gmail.com', 23, 3),
(3, 'Seema', 'lkklk@gmail.com', 12, 5), (4, 'Sayali', 'xzcxc@gmail.com', 78, 2),
(5, 'Aditya', 'cvvcb@gmail.com', 49, 4), (6, 'Archit', 'gfdfg@gmail.com', 50, 1);

-- PURCHASE
INSERT INTO PURCHASE (Prid, Lid, Sid, Pid, Bid, Quantity, Date, Totalcost) VALUES
(1001, 1, 1, 3, 1, 100, '2015-07-12', 70000),
(1002, 2, 3, 4, 2, 1000, '2015-04-10', 80000),
(1003, 1, 4, 2, 5, 45, '2016-08-01', 4500),
(1004, 4, 1, 5, 6, 34, '2016-02-06', 23000),
(1005, 3, 4, 1, 9, 20, '2017-03-15', 1200),
(1006, 1, 2, 4, 10, 89, '2017-04-20', 4500),
(1007, 2, 5, 2, 12, 67, '2018-07-25', 5600),
(1008, 3, 2, 4, 15, 45, '2018-03-27', 50000),
(1009, 4, 3, 1, 16, 340, '2019-02-12', 7800),
(1010, 1, 1, 2, 17, 23, '2020-07-11', 10000);

-- A_specialization
INSERT INTO A_specialization (Spec_id, Aid, Spec_name) VALUES 
(101, 1, 'Technical'), (201, 1, 'Fiction'), (301, 2, 'Non_Fiction'), 
(401, 3, 'Autobiographies'), (501, 2, 'Technical'), (601, 4, 'Real life stories');

-- ISSUE
INSERT INTO ISSUE (Issueid, Memid, Bid, Bnid, Lid, Issuedate, Returndate) VALUES
(205, 44, 2, 1, 2, '2020-03-12', '2020-04-12'),
(206, 12, 7, 1, 1, '2020-05-10', NULL),
(207, 78, 4, 3, 10, '2019-03-05', '2019-08-05'),
(208, 13, 10, 1, 8, '2019-04-09', '2019-06-09'),
(209, 35, 12, 2, 1, '2020-10-07', '2020-12-07'),
(210, 45, 2, 2, 2, '2020-04-06', NULL);

-- SELLS
INSERT INTO SELLS (Sid, Bid, Pid) VALUES
(1, 1, 2), (5, 3, 2), (3, 2, 3), (2, 6, 5), (1, 10, 5), (4, 14, 1);

-- Employee
INSERT INTO Employee (Empid, Empname, Email, Salary, Lid) VALUES
(111, 'Shilpa', 'sdfdsf@gmail.com', 10000, 1),
(222, 'Shivani', 'sadsf@gmail.com', 20000, 1),
(333, 'Hemani', 'ertet@gmail.com', 50000, 2),
(444, 'Rekha', 'scdsf@gmail.com', 35000, 3),
(555, 'Anil', 'asd@gmail.com', 45000, 5),
(666, 'Suhas', 'fdgfg@gmail.com', 20000, 2);

-- Task 4: Solving 10 Queries
-- 1. Which institute libraries are located in Pune city?
SELECT * FROM Ilibrary WHERE city = 'Pune';

-- 2. To which institute CS department belongs to?
SELECT Institute_name FROM DEPARTMENT WHERE Deptname = 'CS';

-- 3. Find all the books whose price is between 800 to 12000?
SELECT * FROM BOOKS WHERE Price BETWEEN 800 AND 12000;

-- 4. Find out such employees who's salaries are not greater than 50,000
SELECT * FROM Employee WHERE Salary <= 50000;

-- 5. Find out such sellers who's name end with "ta"
SELECT * FROM SELLER WHERE SIname LIKE '%ta';

-- 6. Find out such institute libraries where their area information is missing
SELECT * FROM Ilibrary WHERE Area IS NULL;

-- 7. Find out such staff members who's name doesn't starts with "A"
SELECT * FROM STAFF WHERE Stname NOT LIKE 'A%';

-- 8. Find out such SIU libraries which have institute libraries located in Bangalore
SELECT * FROM Ilibrary WHERE city = 'Bangalore';

-- 9. Which students belong to civil department?
SELECT * FROM STUDENT WHERE Deptid IN (SELECT Deptid FROM DEPARTMENT WHERE Deptname = 'Civil');

-- 10. Delete the purchase details which are happened in 2016
DELETE FROM PURCHASE WHERE YEAR(Date) = 2016;

-- Task 5: Solving 15 Queries
-- 1. Find the cheapest book of SIBM library
SELECT MIN(Price) FROM BOOKS WHERE Lid IN (SELECT Lid FROM Ilibrary WHERE Lname = 'SIBMLib');

-- 2. Which library has the costliest book?
SELECT Lname FROM Ilibrary WHERE Lid IN (SELECT Lid FROM BOOKS WHERE Price IN (SELECT MAX(Price) FROM BOOKS));

-- 3. How many students from SIT issued the book?
SELECT COUNT(Memid) FROM ISSUE WHERE Memid IN 
(SELECT Memid FROM STUDENT WHERE Deptid IN (SELECT Deptid FROM DEPARTMENT WHERE Institute_name='SIT'));

-- 4. What is the average cost of books in SITM library?
SELECT AVG(Price) FROM BOOKS WHERE Lid IN(SELECT Lid FROM Ilibrary WHERE Lname = 'SITMHLib');

-- 5. What is the total cost of purchase made by SIT between Jan to June
SELECT SUM(Totalcost) FROM PURCHASE WHERE MONTH(Date) BETWEEN 1 AND 6 AND Lid IN(SELECT Lid FROM Ilibrary WHERE Lname = 'SITLib');

-- 6. How many books are written by "Shruti"
SELECT COUNT(Bid) FROM Writes WHERE Aid IN (SELECT Aid FROM AUTHOR WHERE Aname ='Shruti');

-- 7. What is the costliest book published by "Pragati Book Store"
SELECT MAX(Price) FROM BOOKS WHERE Bid IN (SELECT Bid FROM PURCHASE WHERE Pid IN
(SELECT Pid FROM PUBLISHER WHERE Pname = 'Pragati book store'));

-- 8. How many total copies of books do SIT has?
SELECT COUNT(*) FROM Noofcopies WHERE Bid IN (SELECT Bid FROM BOOKS WHERE Lid IN (SELECT Lid FROM Ilibrary WHERE Lname='SITLib'));

-- 9. What is the average cost of books written by Shivam Kapoor?
SELECT AVG(Price) FROM BOOKS WHERE Bid IN (SELECT Bid FROM Writes WHERE Aid IN (SELECT Aid FROM AUTHOR WHERE Aname='Shivam Kapoor'));

-- 10. How many books are sold by seller living in Pune?
SELECT COUNT(Bid) FROM BOOKS WHERE Bid IN (SELECT Bid FROM SELLS WHERE Sid IN (SELECT Sid FROM SELLER WHERE City='Pune'));

-- 11. Print the student name in capital who belongs to SSBS
SELECT UPPER(Sname) FROM STUDENT WHERE Memid IN (SELECT Memid FROM MEMBER WHERE Lid IN (SELECT Lid FROM Ilibrary WHERE Lname='SSBSLib'));

-- 12. Add two months to the issue date of book written by "Shivam Kapoor"
SELECT Issuedate, DATE_ADD(Issuedate, INTERVAL 60 DAY) 'After 2 months' FROM ISSUE WHERE Bid IN
(SELECT Bid FROM Writes WHERE Aid IN (SELECT Aid FROM AUTHOR WHERE Aname = 'Shivam Kapoor'));

-- 13. What was the last day of the month when Satish issued the book?
SELECT LAST_DAY(Issuedate) FROM ISSUE WHERE
Memid IN (SELECT Memid FROM STUDENT WHERE Sname='Satish') OR
Memid IN (SELECT Memid FROM STAFF WHERE Stname='Satish');

-- 14. How many books are issued from January to march 2010 and 2020?
SELECT COUNT(Bid) FROM ISSUE WHERE MONTH(Issuedate) BETWEEN 1 AND 3 AND (YEAR(Issuedate) BETWEEN 2010 AND 2020);

-- 15. How many books have copies less than 5 available in the SIBM library?
SELECT Bname, BOOKS.Bid, BOOKS.Lid FROM BOOKS, Ilibrary WHERE
BOOKS.Lid = Ilibrary.Lid AND Ilibrary.Lname = 'SIBMLib' AND
Bid IN (SELECT Bid FROM Noofcopies GROUP BY Bid HAVING COUNT(Bid) < 5);

-- Task 6: Solving Queries
-- 1. Give library wise book details
SELECT * FROM BOOKS ORDER BY Lid;

-- 2. Give bookwise total copies which are available
SELECT b.Bid, b.Bname, COUNT(n.Bid) FROM BOOKS b, Noofcopies n 
WHERE b.Bid = n.Bid GROUP BY n.Bid;

-- 3. Which library has total copies more than 5?
SELECT Lname, COUNT(n.Bid) FROM Ilibrary i, Noofcopies n
WHERE n.Blid = i.Lid GROUP BY n.Blid HAVING COUNT(n.Bid) > 5;

-- 4. Give institute wise department details
SELECT Institute_name, Deptname FROM DEPARTMENT ORDER BY Institute_name;

-- 5. Give citywise seller details
SELECT * FROM SELLER ORDER BY City;

-- 6. Give author wise book details that have authored more than 2 books
SELECT b.Bid, b.Bname, a.Aid, a.Aname, w.Pid
FROM AUTHOR a, BOOKS b, Writes w
WHERE a.Aid = w.Aid AND w.Bid = b.Bid
AND EXISTS (SELECT Aid FROM Writes GROUP BY Aid HAVING COUNT(Aid) > 2)
ORDER BY Aname;

-- 7. Give book details library wise whose price is less than 1000
SELECT * FROM BOOKS WHERE Price < 1000 ORDER BY Lid;

-- 8. Give department wise staff details
SELECT * FROM DEPARTMENT ORDER BY Deptid;

-- 9. How many books are issued library wise
SELECT Lid, COUNT(Issueid) FROM ISSUE GROUP BY Lid ORDER BY Lid;

-- 10. Give purchase details publisher wise
SELECT * FROM PURCHASE ORDER BY Pid;

-- 11. Display books in a descending order of their cost
SELECT * FROM BOOKS ORDER BY Price DESC;

-- Task 7: Solving Queries
-- 1. Students in the Civil department
SELECT Stid, Sname, Memid, d.Deptid, Deptname
FROM STUDENT, DEPARTMENT d
WHERE STUDENT.Deptid = d.Deptid AND Deptname ='Civil';

-- 2. Books in SIT library
SELECT b.Bname 'Book title', b.Price 'Book price',
l.Lname 'Library Name', l.City 'City'
FROM Ilibrary l NATURAL JOIN BOOKS b WHERE l.Lname = 'SITLib';

-- 3. Books with less than 3 copies in SIT Library
SELECT COUNT(*) 'Total copies', n.Bid 'Book ID',
b.Bname 'Title of book', b.Price 'Price of book'
FROM Noofcopies n JOIN BOOKS b ON n.Bid = b.Bid
JOIN Ilibrary i ON b.Lid = i.Lid AND i.Lname='SITLib'
GROUP BY b.Bid HAVING COUNT(n.Bid) < 3;

-- 4. Sellers in the same city as SIT
SELECT s.City 'Seller City', s.SIname 'Seller name', i.City 'Library city',
i.Lname 'Library name', i.Area 'Area'
FROM SELLER s INNER JOIN Ilibrary i
ON s.City = i.City AND i.Lname = 'SITLib';

-- 5. Sellers selling books to SIT
SELECT b.Bid, b.Bname, s.SIname, s.City
FROM BOOKS b NATURAL JOIN SELLS se
NATURAL JOIN SELLER s
NATURAL JOIN Ilibrary i
WHERE i.Lname = 'SITLib';

-- 6. Books authored by Brian Kernighan, and published by Tata McGraw Hill
SELECT b.Bname, a.Aname, p.Pname
FROM BOOKS b NATURAL JOIN Writes w NATURAL JOIN AUTHOR a
NATURAL JOIN PUBLISHER p
WHERE a.Aname = 'Brian Kernighan' AND p.Pname = 'Tata Maegraw hill';

-- 7. Books authored by Ken Thompson
SELECT b.Bname, a.Aname, b.Price, b.Bid
FROM BOOKS b NATURAL JOIN Writes w NATURAL JOIN AUTHOR a
WHERE a.Aname = 'Ken Thompson';

-- 8. Books issued by Meera
SELECT s.Sname, s.Memid, i.Bid, i.Memid FROM STUDENT s
INNER JOIN ISSUE i ON s.Memid = i.Memid AND s.Sname = 'Meera';

-- 9. Books issued by SSBS staff
SELECT s.Staid 'Staff id', b.Bname 'Title of book',
s.Stname AS 'Staff name', l.Lname 'Library', i.Memid 'Member id'
FROM BOOKS b NATURAL JOIN ISSUE i
NATURAL JOIN STAFF s
NATURAL JOIN Ilibrary l
WHERE l.Lname = 'SSBSLib';

-- 10. Publisher that provides books to SSLA through Shiksha
SELECT p.Pname 'Publisher', s.SIname 'Seller', ss.Bid 'Book id',
b.Bname 'Title', i.Lname 'Library'
FROM PUBLISHER p NATURAL JOIN SELLS ss
NATURAL JOIN SELLER s
NATURAL JOIN Ilibrary i
NATURAL JOIN BOOKS b
WHERE i.Lname = 'SSLALib' AND s.SIname = 'Shiksha';

-- 11. Publisher that provides books to SSBS through Kohinoor or Shiksha
SELECT p.Pname 'Publisher', s.SIname 'Seller',
ss.Bid 'Book id', i.Lname 'Library'
FROM PUBLISHER p NATURAL JOIN SELLS ss
NATURAL JOIN SELLER s NATURAL JOIN Ilibrary i
WHERE i.Lname = 'SSBSLib' AND s.SIname IN('Kohinoor', 'Shiksha')
ORDER BY s.SIname;

-- 12. Institutes whose staff and students have issued book with bid 4
SELECT d.Institute_name AS 'Institute name',
uni.Sname AS 'Name', b.Bname AS 'Title of Book'
FROM BOOKS b JOIN ISSUE i ON b.Bid = i.Bid JOIN
(SELECT Sname, Memid, Deptid FROM STUDENT UNION SELECT Stname, Memid, Deptid FROM STAFF) uni
ON uni.Memid = i.Memid
JOIN DEPARTMENT d ON uni.Deptid = d.Deptid
JOIN Ilibrary ins ON ins.Lid = d.Lid WHERE b.Bid = 4;

-- 13. Authors with books costing more than rs 500
SELECT b.Bname, a.Aname, b.Price FROM
BOOKS b JOIN Writes w ON b.Bid = w.Bid
JOIN AUTHOR a ON w.Aid = a.Aid AND b.Price > 500;

-- Task 8: PL/SQL Functions
-- 1. Function to multiply 2 numbers
DELIMITER //
CREATE FUNCTION multiply_numbers(num1 DECIMAL(10,2), num2 DECIMAL(10,2))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE result DECIMAL(10,2);
    SET result = num1 * num2;
    RETURN result;
END //
DELIMITER ;

-- 2. Function to find greater of 2 numbers
DELIMITER //
CREATE FUNCTION greater_number(num1 INT, num2 INT)
RETURNS INT
deterministic
BEGIN
    IF num1 > num2 THEN
        RETURN num1;
    ELSE
        RETURN num2;
    END IF;
END //
DELIMITER ;

-- 3. Function to find total number of books
DELIMITER //
CREATE FUNCTION total_books()
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total FROM BOOKS;
    RETURN total;
END //
DELIMITER ;

-- 4. Function to find average of 4 numbers
DELIMITER //
CREATE FUNCTION average_of_four(num1 DECIMAL(10,2), num2 DECIMAL(10,2), num3 DECIMAL(10,2), num4 DECIMAL(10,2))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE avg_num DECIMAL(10,2);
    SET avg_num = (num1 + num2 + num3 + num4) / 4;
    RETURN avg_num;
END //
DELIMITER ;

-- 5. Function to find factorial
DELIMITER //
CREATE FUNCTION factorial(n INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE fact INT DEFAULT 1;
    DECLARE i INT DEFAULT 1;
    
    WHILE i <= n DO
        SET fact = fact * i;
        SET i = i + 1;
    END WHILE;
    
    RETURN fact;
END //
DELIMITER ;

-- 6. Function to find the name of the library
DELIMITER //
CREATE FUNCTION get_library_name(lib_id INT)
RETURNS VARCHAR(255)
READS SQL DATA
BEGIN
    DECLARE lib_name VARCHAR(255);
    SELECT Lname INTO lib_name FROM Ilibrary WHERE Lid = lib_id;
    RETURN lib_name;
END //
DELIMITER ;

-- 7. Function to find total no. of books in a library
DELIMITER //
CREATE FUNCTION count_books_in_library(lib_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE book_count INT;
    SELECT COUNT(*) INTO book_count FROM BOOKS WHERE Lid = lib_id;
    RETURN book_count;
END //
DELIMITER ;