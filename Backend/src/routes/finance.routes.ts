import { Router } from "express";
import { createMovement, getCashLedger, getCashSummary, removeMovement } from "../controllers/cash.controller";
import {
    createAdvanceHandler,
    createPayout,
    getAdvances,
    getPayout,
    getPayouts,
    getPendingPayoutDetail,
    getPendingPayouts,
    removeAdvance,
    removePayout,
} from "../controllers/payout.controller";
import {
    createProductHandler,
    createSaleHandler,
    getProducts,
    getSales,
    removeSale,
    updateProductHandler,
} from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { staffActionsRateLimit } from "../middlewares/rate-limit.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    createAdvanceSchema,
    createCashMovementSchema,
    createPayoutSchema,
    createProductSchema,
    createSaleSchema,
    updateProductSchema,
} from "../schemas/finance.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(staffActionsRateLimit, authenticate);

const managers = authorize("admin", "admin_barber");
const staff = authorize("admin", "admin_barber", "barber");

// Liquidaciones a barberos
router.get("/payouts/pending", managers, asyncHandler(getPendingPayouts));
router.get("/payouts/pending/:barberId", managers, asyncHandler(getPendingPayoutDetail));
router.get("/payouts", managers, asyncHandler(getPayouts));
router.get("/payouts/:id", managers, asyncHandler(getPayout));
router.post("/payouts", managers, validate(createPayoutSchema), asyncHandler(createPayout));
router.delete("/payouts/:id", managers, asyncHandler(removePayout));

// Adelantos
router.get("/advances", managers, asyncHandler(getAdvances));
router.post("/advances", managers, validate(createAdvanceSchema), asyncHandler(createAdvanceHandler));
router.delete("/advances/:id", managers, asyncHandler(removeAdvance));

// Productos y ventas
router.get("/products", staff, asyncHandler(getProducts));
router.post("/products", managers, validate(createProductSchema), asyncHandler(createProductHandler));
router.patch("/products/:id", managers, validate(updateProductSchema), asyncHandler(updateProductHandler));
router.get("/sales", managers, asyncHandler(getSales));
router.post("/sales", staff, validate(createSaleSchema), asyncHandler(createSaleHandler));
router.delete("/sales/:id", managers, asyncHandler(removeSale));

// Caja
router.get("/cash/summary", managers, asyncHandler(getCashSummary));
router.get("/cash/ledger", managers, asyncHandler(getCashLedger));
router.post("/cash/movements", managers, validate(createCashMovementSchema), asyncHandler(createMovement));
router.delete("/cash/movements/:id", managers, asyncHandler(removeMovement));

export default router;
