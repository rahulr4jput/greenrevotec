const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Multer Configuration for Resume Uploads
const uploadDir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ID Code Generators ────────────────────────

// Generate Job Opening Code: JOB-{DEPT}-{YYYYMMDD}-{SEQ}
async function generateJobCode(department) {
    const deptCode = department
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase();
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0');
    const prefix = `JOB-${deptCode}-${dateStr}-`;

    // Find the latest job with the same prefix
    const latest = await prisma.jobOpening.findFirst({
        where: { jobCode: { startsWith: prefix } },
        orderBy: { jobCode: 'desc' }
    });

    let seq = 1;
    if (latest && latest.jobCode) {
        const lastSeq = parseInt(latest.jobCode.split('-').pop(), 10);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(3, '0')}`;
}

// Generate App Code: APP-{JOBCODE}-{SEQ}
async function generateAppCode(jobCode) {
    const prefix = `APP-${jobCode}-`;

    const latest = await prisma.jobApplication.findFirst({
        where: { appCode: { startsWith: prefix } },
        orderBy: { appCode: 'desc' }
    });

    let seq = 1;
    if (latest && latest.appCode) {
        const lastSeq = parseInt(latest.appCode.split('-').pop(), 10);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(3, '0')}`;
}

// API: Save Lead
app.post('/api/leads', async (req, res) => {
    try {
        const { name, email, phone, subject, message, type, source, productName } = req.body;
        const lead = await prisma.lead.create({
            data: {
                name,
                email,
                phone,
                subject,
                message,
                type,
                source,
                productName,
                timestamp: new Date()
            }
        });
        res.json(lead);
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// API: Get All Leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { timestamp: 'desc' }
        });
        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// API: Delete Lead
app.delete('/api/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lead.deleteMany({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: 'Failed to delete lead', details: error.message });
    }
});

// Settings APIs (to migrate other localStorage data)
app.get('/api/settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await prisma.setting.findUnique({
            where: { key }
        });
        res.json(setting ? JSON.parse(setting.value) : null);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

app.post('/api/settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value: JSON.stringify(value) },
            create: { key, value: JSON.stringify(value) }
        });
        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save setting' });
    }
});

// API: Crops
app.get('/api/crops', async (req, res) => {
    try {
        const crops = await prisma.crop.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch crops' });
    }
});

app.post('/api/crops', async (req, res) => {
    try {
        const { name, imageUrl, language, linkedToId } = req.body;
        const crop = await prisma.crop.create({
            data: { name, imageUrl, language, linkedToId }
        });
        res.json(crop);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A crop with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create crop' });
    }
});

app.delete('/api/crops/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.crop.deleteMany({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting crop:', error);
        res.status(500).json({ error: 'Failed to delete crop', details: error.message });
    }
});

// API: Languages
app.get('/api/languages', async (req, res) => {
    try {
        const languages = await prisma.language.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(languages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch languages' });
    }
});

app.post('/api/languages', async (req, res) => {
    try {
        const { name, script } = req.body;
        const language = await prisma.language.create({
            data: { name, script }
        });
        res.json(language);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A language with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create language' });
    }
});

app.delete('/api/languages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.language.deleteMany({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting language:', error);
        res.status(500).json({ error: 'Failed to delete language', details: error.message });
    }
});

// CATEGORIES
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { id, name, description, language, linkedToId } = req.body;

        let category;
        if (id && id.startsWith('cat-') && !id.includes(Date.now().toString())) {
            // Logic to check if we should update or create
        }

        category = await prisma.category.upsert({
            where: { id: id || 'temp-id' },
            update: { name, description, language, linkedToId },
            create: { name, description, language, linkedToId }
        });
        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save category' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await prisma.category.deleteMany({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category', details: error.message });
    }
});

// SERVICE CATEGORIES
app.get('/api/service-categories', async (req, res) => {
    try {
        const categories = await prisma.serviceCategory.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching service categories:', error);
        res.status(500).json({ error: 'Failed to fetch service categories' });
    }
});

app.post('/api/service-categories', async (req, res) => {
    try {
        const { name, description, language, linkedToId } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const category = await prisma.serviceCategory.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                language: language || 'English',
                linkedToId: linkedToId || null
            }
        });
        res.json(category);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A service category with this name already exists for the selected language' });
        }
        console.error('Error creating service category:', error);
        res.status(500).json({ error: 'Failed to create service category' });
    }
});

app.put('/api/service-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, language, linkedToId } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const category = await prisma.serviceCategory.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                language: language || 'English',
                linkedToId: linkedToId || null
            }
        });
        res.json(category);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A service category with this name already exists for the selected language' });
        }
        console.error('Error updating service category:', error);
        res.status(500).json({ error: 'Failed to update service category' });
    }
});

app.delete('/api/service-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.serviceCategory.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting service category:', error);
        res.status(500).json({ error: 'Failed to delete service category', details: error.message });
    }
});

// PRODUCTS

app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Parse JSON strings back to arrays
        const parsedProducts = products.map(p => ({
            ...p,
            id: p.id, // Keeping as is (number)
            images: JSON.parse(p.images),
            features: JSON.parse(p.features),
            bulletPoints: JSON.parse(p.bulletPoints),
            applicableCrops: JSON.parse(p.applicableCrops)
        }));
        res.json(parsedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

const saveProduct = async (req, res) => {
    try {
        const data = req.body;
        // Parse ID as integer if it exists
        const id = data.id && data.id !== 'undefined' ? parseInt(data.id) : null;

        // Stringify arrays for DB storage (JSON columns)
        const dbData = {
            ...data,
            images: JSON.stringify(data.images || []),
            features: JSON.stringify(data.features || []),
            bulletPoints: JSON.stringify(data.bulletPoints || []),
            applicableCrops: JSON.stringify(data.applicableCrops || []),
        };

        // Remove id from the data object to prevent Prisma errors
        delete dbData.id;

        let product;
        if (id && !isNaN(id)) {
            // Update existing
            product = await prisma.product.upsert({
                where: { id },
                update: dbData,
                create: { ...dbData, id }
            });
        } else {
            // Create new
            product = await prisma.product.create({
                data: dbData
            });
        }
        res.json(product);
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Failed to save product', details: error.message });
    }
};

app.post('/api/products', saveProduct);
app.put('/api/products', saveProduct);

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            // If the ID is not a number (like the old 'temp-' IDs), just return success
            return res.json({ success: true, message: 'Invalid ID format, skipped deletion' });
        }

        // deleteMany is robust: doesn't fail if item doesn't exist
        const result = await prisma.product.deleteMany({ where: { id: numericId } });
        res.json({ success: true, count: result.count });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
});

// SERVICES
app.get('/api/services', async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const parsedServices = services.map(s => ({
            ...s,
            bulletPoints: JSON.parse(s.bulletPoints),
            additionalImages: JSON.parse(s.additionalImages),
            contentBlocks: JSON.parse(s.contentBlocks || '[]')
        }));
        res.json(parsedServices);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

app.post('/api/services', async (req, res) => {
    try {
        const data = req.body;
        const dbData = {
            ...data,
            bulletPoints: JSON.stringify(data.bulletPoints || []),
            additionalImages: JSON.stringify(data.additionalImages || []),
            contentBlocks: JSON.stringify(data.contentBlocks || []),
            id: data.id ? data.id.toString() : undefined
        };

        const service = await prisma.service.upsert({
            where: { id: dbData.id || 'temp-service-id' },
            update: dbData,
            create: dbData
        });
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save service' });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await prisma.service.deleteMany({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service', details: error.message });
    }
});

// --- CAREERS MODULE ---

// API: Get All Job Openings
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await prisma.jobOpening.findMany({
            orderBy: { createdAt: 'desc' },
            where: req.query.public === 'true' ? { isActive: true } : undefined
        });

        // Parse JSON fields
        const parsedJobs = jobs.map(job => ({
            ...job,
            requirements: JSON.parse(job.requirements || '[]')
        }));

        res.json(parsedJobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// API: Create/Update Job Opening
app.post('/api/jobs', async (req, res) => {
    try {
        const data = req.body;
        const dbData = {
            title: data.title,
            department: data.department,
            location: data.location,
            type: data.type,
            description: data.description,
            requirements: JSON.stringify(data.requirements || []),
            contactEmail: data.contactEmail,
            isActive: data.isActive !== false
        };

        if (data.id) {
            // Update existing job (don't regenerate jobCode)
            const job = await prisma.jobOpening.update({
                where: { id: data.id },
                data: dbData
            });
            res.json(job);
        } else {
            // Create new job — generate jobCode
            const jobCode = await generateJobCode(data.department);
            const job = await prisma.jobOpening.create({
                data: { ...dbData, jobCode }
            });
            res.json(job);
        }
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ error: 'Failed to save job opening' });
    }
});

// API: Delete Job Opening
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        await prisma.jobOpening.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job opening' });
    }
});

// API: Submit Job Application
app.post('/api/applications', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        const { jobOpeningId, candidateName, email, phone, experience, coverLetter } = req.body;

        // Get the job opening to read its jobCode
        const jobOpening = await prisma.jobOpening.findUnique({ where: { id: jobOpeningId } });
        if (!jobOpening) {
            return res.status(400).json({ error: 'Invalid job opening' });
        }

        const jobCode = jobOpening.jobCode || 'JOB-UNK';
        const appCode = await generateAppCode(jobCode);

        // Rename the uploaded resume file
        const ext = path.extname(req.file.originalname).toLowerCase();
        const newFilename = `${jobCode}_${appCode}_Resume${ext}`;
        const oldPath = req.file.path;
        const newPath = path.join(uploadDir, newFilename);
        fs.renameSync(oldPath, newPath);

        const application = await prisma.jobApplication.create({
            data: {
                appCode,
                jobOpeningId,
                candidateName,
                email,
                phone,
                experience,
                coverLetter,
                resumePath: `/uploads/resumes/${newFilename}`
            }
        });

        res.json({ success: true, application });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application', details: error.message });
    }
});

// API: Get Applications (Leads)
app.get('/api/applications', async (req, res) => {
    try {
        const applications = await prisma.jobApplication.findMany({
            include: {
                jobOpening: {
                    select: { title: true, department: true, jobCode: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// API: Download Resume File
app.get('/api/resumes/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', 'resumes', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// All other GET requests return the React app
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
